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

// WebSocket setup
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
});

app.locals.broadcast = (data) => {
    const msg = JSON.stringify(data);
    clients.forEach((client) => {
        if (client.readyState === 1) client.send(msg);
    });
};

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/finance', financeRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));