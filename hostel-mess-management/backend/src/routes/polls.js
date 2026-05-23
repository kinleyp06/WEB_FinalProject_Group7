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
    body('title').notEmpty().withMessage('Title is required'),
    body('day').isIn(['Monday', 'Thursday']).withMessage('Day must be Monday or Thursday'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('polls').isArray({ min: 1 }).withMessage('At least one poll required'),
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
                        options: {
                            // FIX: p.options is an array of { label: string } objects,
                            // not raw strings — must extract .label
                            create: p.options.map((o) => ({ label: o.label })),
                        },
                    })),
                },
            },
            include: {
                polls: {
                    include: {
                        options: { include: { votes: true } },
                        votes: true,
                    },
                },
            },
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
    if (req.user.role === 'ADMIN') {
        return res.status(403).json({ error: 'Admins cannot vote' });
    }

    const { optionId } = req.body;
    if (!optionId) return res.status(400).json({ error: 'optionId is required' });

    const pollId = parseInt(req.params.pollId);
    if (isNaN(pollId)) return res.status(400).json({ error: 'Invalid poll ID' });

    try {
        // Check already voted
        const existing = await prisma.pollVote.findUnique({
            where: { pollId_userId: { pollId, userId: req.user.id } },
        });
        if (existing) {
            return res.status(400).json({ error: 'You have already voted in this poll' });
        }

        // Verify the option belongs to this poll
        const option = await prisma.pollOption.findFirst({
            where: { id: parseInt(optionId), pollId },
        });
        if (!option) {
            return res.status(400).json({ error: 'Invalid option for this poll' });
        }

        const vote = await prisma.pollVote.create({
            data: {
                pollId,
                optionId: parseInt(optionId),
                userId: req.user.id,
            },
        });

        if (req.app.locals.broadcast) {
            req.app.locals.broadcast({ type: 'POLL_UPDATED', pollId });
        }
        res.status(201).json(vote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/polls/special-meals/:id (admin only)
// NOTE: This route must be defined AFTER /:pollId/vote to avoid route conflicts.
// Express matches routes in order — if this were first, "special-meals" would be
// treated as a :pollId param.
router.delete('/special-meals/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.specialMeal.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;