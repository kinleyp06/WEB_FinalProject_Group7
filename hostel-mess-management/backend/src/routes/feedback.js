const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const leoProfanity = require('leo-profanity');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/feedback
router.post('/', authenticate, [
    body('mealPlanId').isInt(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('mealType').isIn(['breakfast', 'lunch', 'dinner']),
], async (req, res) => {
    if (req.user.role === 'ADMIN') return res.status(403).json({ error: 'Admins cannot submit feedback' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const comment = req.body.comment || '';
       const isFlagged = leoProfanity.check(comment);
        const feedback = await prisma.feedback.create({
            data: { ...req.body, userId: req.user.id, comment: isFlagged ? '[Flagged for review]' : comment },
            include: { user: { select: { name: true } }, mealPlan: true },
        });
        res.status(201).json(feedback);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/feedback
router.get('/', authenticate, async (req, res) => {
    try {
        const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };
        const feedbacks = await prisma.feedback.findMany({
            where,
            include: { user: { select: { name: true } }, mealPlan: { select: { day: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(feedbacks);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/feedback/stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({ include: { mealPlan: true } });
        const avgRating = feedbacks.length
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
            : 0;

        const byMealType = { breakfast: [], lunch: [], dinner: [] };
        feedbacks.forEach(f => { if (byMealType[f.mealType]) byMealType[f.mealType].push(f.rating); });

        const mealTypeAvg = Object.entries(byMealType).map(([type, ratings]) => ({
            type,
            avg: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : 0,
            count: ratings.length,
        }));

        const ratingDist = [1, 2, 3, 4, 5].map(r => ({
            rating: r,
            count: feedbacks.filter(f => f.rating === r).length,
        }));

        res.json({ totalFeedbacks: feedbacks.length, avgRating, mealTypeAvg, ratingDist });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;