const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const leoProfanity = require('leo-profanity');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/suggestions
router.post('/', authenticate, [
    body('content').notEmpty().withMessage('Suggestion content required'),
], async (req, res) => {
    if (req.user.role === 'ADMIN') return res.status(403).json({ error: 'Admins cannot submit suggestions' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const isClean = !leoProfanity.check(req.body.content);
        const suggestion = await prisma.suggestion.create({
            data: {
                content: req.body.content,
                userId: req.user.id,
                status: isClean ? 'PENDING' : 'FLAGGED',
            },
            include: { user: { select: { name: true } } },
        });
        res.status(201).json(suggestion);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/suggestions
router.get('/', authenticate, async (req, res) => {
    try {
        const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
        const suggestions = await prisma.suggestion.findMany({
            where,
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(suggestions);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/suggestions/:id
router.patch('/:id', authenticate, requireAdmin, [
    body('adminReply').notEmpty(),
    body('status').isIn(['PENDING', 'REVIEWED', 'IMPLEMENTED']),
], async (req, res) => {
    try {
        const suggestion = await prisma.suggestion.update({
            where: { id: parseInt(req.params.id) },
            data: { adminReply: req.body.adminReply, status: req.body.status },
        });
        res.json(suggestion);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;