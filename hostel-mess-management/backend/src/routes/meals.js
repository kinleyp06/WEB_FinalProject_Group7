const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/meals
router.get('/', authenticate, async (req, res) => {
    try {
        const meals = await prisma.mealPlan.findMany({ orderBy: { weekStart: 'desc' } });
        res.json(meals);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/meals
router.post('/', authenticate, requireAdmin, [
    body('day').notEmpty(),
    body('breakfast').notEmpty(),
    body('lunch').notEmpty(),
    body('dinner').notEmpty(),
    body('weekStart').isISO8601(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const meal = await prisma.mealPlan.create({
            data: {
                ...req.body,
                weekStart: new Date(req.body.weekStart).toISOString(),
            },
        });
        if (req.app.locals.broadcast) req.app.locals.broadcast({ type: 'MEAL_UPDATED', meal });
        res.status(201).json(meal);
    } catch (err) {
        console.error('MEAL CREATE ERROR:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/meals/:id
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const meal = await prisma.mealPlan.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        if (req.app.locals.broadcast) req.app.locals.broadcast({ type: 'MEAL_UPDATED', meal });
        res.json(meal);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/meals/:id
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.mealPlan.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;