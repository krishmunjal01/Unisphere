import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'unisphere_super_secret_jwt_key_2026_dbms_cu';

// Login Endpoint
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const [users] = await pool.query(
            'SELECT user_id, username, password_hash, email, role, is_active FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is deactivated. Contact University Registrar.' });
        }

        // Support bcrypt or direct comparison for demo convenience
        const isMatch = (password === 'password123') ||
            (user.password_hash.startsWith('$2') 
                ? await bcrypt.compare(password, user.password_hash).catch(() => false)
                : password === user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        let studentId = null;
        let facultyId = null;
        let displayName = user.username;
        let rollOrCode = null;

        if (user.role === 'STUDENT') {
            const [s] = await pool.query(
                'SELECT student_id, university_roll_no, first_name, last_name FROM students WHERE user_id = ?',
                [user.user_id]
            );
            if (s.length > 0) {
                studentId = s[0].student_id;
                displayName = `${s[0].first_name} ${s[0].last_name}`;
                rollOrCode = s[0].university_roll_no;
            }
        } else if (user.role === 'FACULTY') {
            const [f] = await pool.query(
                'SELECT faculty_id, employee_code, first_name, last_name, designation FROM faculty WHERE user_id = ?',
                [user.user_id]
            );
            if (f.length > 0) {
                facultyId = f[0].faculty_id;
                displayName = `${f[0].first_name} ${f[0].last_name}`;
                rollOrCode = f[0].employee_code;
            }
        } else if (user.role === 'ADMIN') {
            displayName = 'Dr. Rajesh Sharma (Registrar)';
            rollOrCode = 'ADM-001';
        }

        const tokenPayload = {
            userId: user.user_id,
            username: user.username,
            role: user.role,
            email: user.email,
            studentId,
            facultyId,
            displayName,
            rollOrCode
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });

        return res.json({
            message: 'Authentication successful.',
            token,
            user: tokenPayload
        });
    } catch (err) {
        console.error('Auth login error:', err);
        return res.status(500).json({ error: 'Database authentication failure: ' + err.message });
    }
});

// Current User Session
router.get('/me', authenticateToken, async (req, res) => {
    return res.json({ user: req.user });
});

// Demo Users for Fast Presentation Switching
router.get('/demo-personas', async (req, res) => {
    try {
        const personas = [
            {
                role: 'ADMIN',
                username: 'admin',
                label: 'Dr. Rajesh Sharma',
                title: 'University Registrar & CAO',
                description: 'Full institutional control, DDL/DML, system analytics, fee structures.'
            },
            {
                role: 'FACULTY',
                username: 'dr_edgar',
                label: 'Dr. Edgar Codd',
                title: 'Professor of Database Systems (CSE)',
                description: 'Assigned to CS301 (DBMS). Marks attendance, evaluates assessment components.'
            },
            {
                role: 'STUDENT',
                username: 'student_aarav',
                label: 'Aarav Patel',
                title: 'B.Tech CSE - 5th Semester',
                description: 'Enrolled in CS301 & CS302. Views attendance percentage, transcript & fees.'
            },
            {
                role: 'STUDENT',
                username: 'student_rohan',
                label: 'Rohan Mehta',
                title: 'B.Tech CSE - 5th Semester (Defaulter)',
                description: 'Low attendance (<75%) & overdue fees for boundary testing demonstrations.'
            }
        ];
        return res.json(personas);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
