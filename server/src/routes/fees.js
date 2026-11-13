import express from 'express';
import pool from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List Fee Invoices
router.get('/invoices', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT 
                fi.invoice_id,
                fi.invoice_number,
                fi.student_id,
                s.university_roll_no,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                p.program_code,
                sem.semester_code,
                fi.gross_amount,
                fi.scholarship_deduction,
                fi.net_payable,
                fi.paid_amount,
                fi.balance_amount,
                fi.due_date,
                fi.status,
                fi.created_at
            FROM fee_invoices fi
            JOIN students s ON fi.student_id = s.student_id
            JOIN programs p ON s.program_id = p.program_id
            JOIN academic_semesters sem ON fi.semester_id = sem.semester_id
        `;
        const params = [];

        if (req.user.role === 'STUDENT') {
            query += ' WHERE fi.student_id = ?';
            params.push(req.user.studentId);
        } else if (req.query.studentId) {
            query += ' WHERE fi.student_id = ?';
            params.push(req.query.studentId);
        }

        query += ' ORDER BY fi.created_at DESC';

        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Fee Defaulters View
router.get('/defaulters', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vw_fee_defaulters ORDER BY days_overdue DESC');
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

// Admin: Bulk Generate Semester Invoices via Stored Procedure
router.post('/generate-invoices', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
    const { semesterId, dueDate } = req.body;

    if (!semesterId || !dueDate) {
        return res.status(400).json({ error: 'semesterId and dueDate are required.' });
    }

    try {
        await pool.query('CALL sp_generate_semester_invoices(?, ?, @count)', [semesterId, dueDate]);
        const [[output]] = await pool.query('SELECT @count AS generatedCount');

        return res.json({
            success: true,
            message: `Batch billing procedure completed. Generated ${output.generatedCount} invoices.`,
            generatedCount: output.generatedCount
        });
    } catch (err) {
        return res.status(500).json({ error: 'Invoice generation procedure failed: ' + err.message });
    }
});

// Process Fee Payment via ACID Stored Procedure
router.post('/pay', authenticateToken, async (req, res) => {
    const { invoiceId, amountPaid, paymentMode, transactionReference } = req.body;
    const receivedBy = req.user.userId;

    if (!invoiceId || !amountPaid || !paymentMode) {
        return res.status(400).json({ error: 'invoiceId, amountPaid, and paymentMode are required.' });
    }

    const ref = transactionReference || `TXN-UNISPHERE-${Date.now()}`;

    try {
        await pool.query(
            'CALL sp_process_fee_payment(?, ?, ?, ?, ?, @receipt, @code, @msg)',
            [invoiceId, amountPaid, paymentMode, ref, receivedBy]
        );

        const [[output]] = await pool.query(
            'SELECT @receipt AS receiptNumber, @code AS statusCode, @msg AS message'
        );

        if (output.statusCode === 'SUCCESS') {
            return res.json({
                success: true,
                receiptNumber: output.receiptNumber,
                statusCode: output.statusCode,
                message: output.message
            });
        } else {
            return res.status(400).json({
                success: false,
                statusCode: output.statusCode,
                error: output.message
            });
        }
    } catch (err) {
        return res.status(500).json({ error: 'Payment transaction failed: ' + err.message });
    }
});

// Payments Ledger
router.get('/payments', authenticateToken, async (req, res) => {
    try {
        let query = `
            SELECT 
                p.payment_id,
                p.receipt_number,
                p.invoice_id,
                fi.invoice_number,
                s.university_roll_no,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                p.amount_paid,
                p.payment_mode,
                p.transaction_reference,
                p.payment_date,
                p.status
            FROM payments p
            JOIN fee_invoices fi ON p.invoice_id = fi.invoice_id
            JOIN students s ON fi.student_id = s.student_id
        `;
        const params = [];

        if (req.user.role === 'STUDENT') {
            query += ' WHERE fi.student_id = ?';
            params.push(req.user.studentId);
        }

        query += ' ORDER BY p.payment_date DESC';

        const [rows] = await pool.query(query, params);
        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: 'Database query failure: ' + err.message });
    }
});

export default router;

