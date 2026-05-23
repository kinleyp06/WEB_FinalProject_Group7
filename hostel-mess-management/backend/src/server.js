const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const feedbackRoutes = require('./routes/feedback');
const suggestionRoutes = require('./routes/suggestions');
const announcementRoutes = require('./routes/announcements');
const pollRoutes = require('./routes/polls');
const financeRoutes = require('./routes/finance');

const app = express();
const server = http.createServer(app);

// ── WebSocket setup ───────────────────────────────────────────────────────────
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`[WS] Client connected. Total: ${clients.size}`);

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`[WS] Client disconnected. Total: ${clients.size}`);
    });
    ws.on('error', (err) => {
        console.error('[WS] Error:', err.message);
        clients.delete(ws);
    });
});

// Broadcast to all connected clients
app.locals.broadcast = (data) => {
    const msg = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === 1) client.send(msg);
    });
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// ── Static file serving ───────────────────────────────────────────────────────
// FIX: finance.js writes uploads to <project_root>/uploads/
// server.js is at <project_root>/backend/src/server.js
// so the correct relative path from here is ../../../uploads (3 levels up then into uploads)
// Adjust this if your folder structure differs.
const uploadsPath = path.join(__dirname, '../../../uploads');
app.use('/uploads', express.static(uploadsPath));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/finance', financeRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving uploads from: ${uploadsPath}`);
});