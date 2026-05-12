const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/polls/special-meals
router.get('/special-meals', authenticate, async (req, res) => {
    try {
        const meals = await prisma.specialMeal.findMany({
            include: {
                polls: {
                    include: {
                        options: { include: { votes: true } },
                        votes: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
        res.json(meals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/polls/special-meals (admin only)
router.post('/special-meals', authenticate, requireAdmin, [
    body('title').notEmpty(),
    body('day').isIn(['Monday', 'Thursday']),
    body('date').isISO8601(),
    body('polls').isArray({ min: 1 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { title, day, date, polls } = req.body;
        const specialMeal = await prisma.specialMeal.create({
            data: {
                title,
                day,
                date: new Date(date).toISOString(),
                polls: {
                    create: polls.map((p) => ({
                        question: p.question,
                        options: { create: p.options.map((o) => ({ label: o })) },
                    })),
                },
            },
            include: { polls: { include: { options: true } } },
        });
        if (req.app.locals.broadcast) {
            req.app.locals.broadcast({ type: 'NEW_SPECIAL_MEAL', specialMeal });
        }
        res.status(201).json(specialMeal);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/polls/:pollId/vote (student only)
router.post('/:pollId/vote', authenticate, async (req, res) => {
    if (req.user.role === 'ADMIN') return res.status(403).json({ error: 'Admins cannot vote' });
    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'optionId required' });

    try {
        const existing = await prisma.pollVote.findUnique({
            where: { pollId_userId: { pollId: parseInt(req.params.pollId), userId: req.user.id } },
        });
        if (existing) return res.status(400).json({ error: 'You have already voted in this poll' });

        const vote = await prisma.pollVote.create({
            data: {
                pollId: parseInt(req.params.pollId),
                optionId: parseInt(optionId),
                userId: req.user.id,
            },
        });
        if (req.app.locals.broadcast) {
            req.app.locals.broadcast({ type: 'POLL_UPDATED', pollId: parseInt(req.params.pollId) });
        }
        res.status(201).json(vote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/polls/special-meals/:id (admin only)
router.delete('/special-meals/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.specialMeal.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;