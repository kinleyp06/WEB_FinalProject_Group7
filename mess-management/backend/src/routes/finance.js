const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Setup upload folder
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        cb(null, allowed.includes(file.mimetype));
    },
});

// GET /api/finance/bills
router.get('/bills', authenticate, requireAdmin, async (req, res) => {
    try {
        const bills = await prisma.groceryBill.findMany({ orderBy: { weekStart: 'desc' } });
        res.json(bills);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/finance/bills
router.post('/bills', authenticate, requireAdmin, upload.single('receipt'), [
    body('description').notEmpty(),
    body('totalCost').isFloat({ min: 0 }),
    body('weekStart').isISO8601(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
        const bill = await prisma.groceryBill.create({
            data: {
                description: req.body.description,
                totalCost: parseFloat(req.body.totalCost),
                weekStart: new Date(req.body.weekStart).toISOString(),
                receiptUrl: req.file ? `/uploads/${req.file.filename}` : null,
            },
        });
        res.status(201).json(bill);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/finance/bills/:id
router.delete('/bills/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await prisma.groceryBill.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;