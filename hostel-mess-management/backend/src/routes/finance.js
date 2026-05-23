const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// FIX: Consistent upload path — server.js serves /uploads as static from this
// same directory, so both multer storage and server.js static must agree.
// Files live at <project_root>/uploads/ (one level above /backend).
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
        }
    },
});

// Multer error handler middleware (must have 4 args for Express to treat as error handler)
function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
}

// GET /api/finance/bills
router.get('/bills', authenticate, requireAdmin, async (req, res) => {
    try {
        const bills = await prisma.groceryBill.findMany({
            orderBy: { weekStart: 'desc' },
        });
        res.json(bills);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/finance/bills
router.post(
    '/bills',
    authenticate,
    requireAdmin,
    upload.single('receipt'),
    handleUploadError,
    [
        body('description').notEmpty().withMessage('Description is required'),
        body('totalCost').isFloat({ min: 0 }).withMessage('Total cost must be a positive number'),
        body('weekStart').isISO8601().withMessage('Valid date required'),
    ],
    async (req, res) => {
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
    }
);

// DELETE /api/finance/bills/:id
router.delete('/bills/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const bill = await prisma.groceryBill.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

        // Delete receipt file from disk if it exists
        if (bill.receiptUrl) {
            const filePath = path.join(uploadDir, path.basename(bill.receiptUrl));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.groceryBill.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;