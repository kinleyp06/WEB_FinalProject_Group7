const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/announcements
router.get('/', authenticate, async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(announcements);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/announcements
router.post('/', authenticate, requireAdmin, [
    body('title').notEmpty(),
    body('content').notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const announcement = await prisma.announcement.create({ data: req.body });
        if (req.app.locals.broadcast) {
            req.app.locals.broadcast({ type: 'NEW_ANNOUNCEMENT', announcement });
        }
        res.status(201).json(announcement);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.announcement.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;