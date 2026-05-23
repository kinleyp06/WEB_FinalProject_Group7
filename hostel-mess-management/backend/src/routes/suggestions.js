const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const leoProfanity = require('leo-profanity');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/suggestions
router.post('/', authenticate, [
    body('content').notEmpty().withMessage('Suggestion content is required'),
], async (req, res) => {
    if (req.user.role === 'ADMIN') {
        return res.status(403).json({ error: 'Admins cannot submit suggestions' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const isFlagged = leoProfanity.check(req.body.content);
        const suggestion = await prisma.suggestion.create({
            data: {
                content: req.body.content,
                userId: req.user.id,
                status: isFlagged ? 'FLAGGED' : 'PENDING',
            },
            include: { user: { select: { name: true, email: true } } },
        });
        res.status(201).json(suggestion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/suggestions
router.get('/', authenticate, async (req, res) => {
    try {
        const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
        const suggestions = await prisma.suggestion.findMany({
            where,
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(suggestions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// FIX 1: Changed PATCH → PUT to match frontend call (PUT /api/suggestions/:id)
// FIX 2: adminReply is now optional (removed notEmpty constraint)
// FIX 3: Added 'FLAGGED' to allowed status values
router.put('/:id', authenticate, requireAdmin, [
    body('status')
        .isIn(['PENDING', 'REVIEWED', 'IMPLEMENTED', 'FLAGGED'])
        .withMessage('Invalid status value'),
    body('adminReply').optional().isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const updateData = { status: req.body.status };

        // Only update adminReply if provided
        if (req.body.adminReply !== undefined) {
            updateData.adminReply = req.body.adminReply;
        }

        const suggestion = await prisma.suggestion.update({
            where: { id: parseInt(req.params.id) },
            data: updateData,
            include: { user: { select: { name: true, email: true } } },
        });
        res.json(suggestion);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;