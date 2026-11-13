import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import facultyRoutes from './routes/faculty.js';
import courseRoutes from './routes/courses.js';
import attendanceRoutes from './routes/attendance.js';
import examRoutes from './routes/exams.js';
import feeRoutes from './routes/fees.js';
import timetableRoutes from './routes/timetable.js';
import analyticsRoutes from './routes/analytics.js';
import dbmsLabRoutes from './routes/dbmsLab.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root & API Index Endpoints
app.get(['/', '/api'], async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT VERSION() AS mysqlVersion');
        return res.json({
            system: "UniSphere Academic Intelligence & ERP System",
            status: "ONLINE",
            database: "MySQL 8.0 (unisphere_db)",
            engine_version: rows[0].mysqlVersion,
            frontend_portal: "http://localhost:3000",
            modules: {
                health: "/api/health",
                auth: "/api/auth/demo-personas",
                students: "/api/students",
                faculty: "/api/faculty/workload",
                courses: "/api/courses/offerings",
                attendance: "/api/attendance/summary",
                exams: "/api/exams/marks/1",
                fees: "/api/fees/invoices",
                timetable: "/api/timetable/master",
                analytics: "/api/analytics/kpi",
                dbms_lab: "/api/dbms-lab/recursive-cte"
            }
        });
    } catch (err) {
        return res.json({
            system: "UniSphere Academic Intelligence & ERP System",
            status: "ONLINE",
            frontend_portal: "http://localhost:3000"
        });
    }
});

// Health check & DB connection verification
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT VERSION() AS mysqlVersion, CURRENT_TIMESTAMP AS serverTime');
        return res.json({
            status: 'HEALTHY',
            database: 'CONNECTED',
            engine: rows[0].mysqlVersion,
            serverTime: rows[0].serverTime
        });
    } catch (err) {
        return res.status(500).json({
            status: 'UNHEALTHY',
            database: 'DISCONNECTED',
            error: err.message
        });
    }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dbms-lab', dbmsLabRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

// Start Server
app.listen(PORT, async () => {
    console.log(`=======================================================`);
    console.log(` UniSphere Academic ERP Backend is running on port ${PORT}`);
    console.log(` Target Database: MySQL 8.0 (unisphere_db)`);
    console.log(` Base API URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
    try {
        const [r] = await pool.query('SELECT DATABASE() as db, VERSION() as ver');
        console.log(` Active DB Connection: [${r[0].db}] on MySQL ${r[0].ver}`);
    } catch (e) {
        console.error(' Database Connection Failed:', e.message);
    }
});

