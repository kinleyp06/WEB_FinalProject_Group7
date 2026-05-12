const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Profanity filter words
const badWords = ['shit', 'fuck', 'damn', 'stupid', 'idiot', 'hate', 'crap', 'asshole', 'bitch', 'terrible', 'worst'];

function checkProfanity(text) {
    if (!text) return { hasProfanity: false };
    const lowerText = text.toLowerCase();
    for (const word of badWords) {
        if (lowerText.includes(word)) {
            return { hasProfanity: true, word: word };
        }
    }
    return { hasProfanity: false };
}

// ============= API ROUTES =============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Get all feedback
app.get('/api/feedback', (req, res) => {
    const feedbackData = [
        { id: 1, userName: 'John Doe', comment: 'Great food today!', rating: 5, status: 'APPROVED', createdAt: new Date().toISOString() },
        { id: 2, userName: 'Jane Smith', comment: 'Food is shit', rating: 1, status: 'FLAGGED', flaggedWord: 'shit', createdAt: new Date().toISOString() },
        { id: 3, userName: 'Bob Wilson', comment: 'Delicious meal', rating: 4, status: 'APPROVED', createdAt: new Date().toISOString() },
        { id: 4, userName: 'Alice Brown', comment: 'This is stupid food', rating: 2, status: 'FLAGGED', flaggedWord: 'stupid', createdAt: new Date().toISOString() }
    ];
    
    res.json({ success: true, data: feedbackData });
});

// Submit new feedback (with profanity check)
app.post('/api/feedback', (req, res) => {
    const { rating, comment, mealType } = req.body;
    
    if (!comment) {
        return res.status(400).json({ 
            success: false, 
            message: 'Comment is required' 
        });
    }
    
    const { hasProfanity, word } = checkProfanity(comment);
    
    if (hasProfanity) {
        return res.json({
            success: true,
            message: `Feedback flagged for review (inappropriate word: ${word})`,
            status: 'FLAGGED',
            data: { rating, comment, mealType, flaggedWord: word }
        });
    }
    
    res.json({
        success: true,
        message: 'Feedback submitted successfully',
        status: 'APPROVED',
        data: { rating, comment, mealType }
    });
});

// Get flagged content (for admin)
app.get('/api/admin/flagged', (req, res) => {
    const flaggedContent = [
        { id: 1, type: 'feedback', comment: 'Food is shit', userName: 'Jane Smith', flaggedWord: 'shit' },
        { id: 2, type: 'feedback', comment: 'This is stupid food', userName: 'Alice Brown', flaggedWord: 'stupid' }
    ];
    
    res.json({ success: true, data: flaggedContent });
});

// Approve flagged content
app.put('/api/admin/approve/:id', (req, res) => {
    const { id } = req.params;
    res.json({ 
        success: true, 
        message: `Content ${id} approved successfully` 
    });
});

// Reject flagged content
app.put('/api/admin/reject/:id', (req, res) => {
    const { id } = req.params;
    res.json({ 
        success: true, 
        message: `Content ${id} rejected successfully` 
    });
});

// Get moderation stats
app.get('/api/admin/stats', (req, res) => {
    res.json({
        success: true,
        data: {
            totalFeedback: 24,
            pendingModeration: 3,
            flagged: 2,
            approved: 19,
            rejected: 3
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Hostel Mess Management API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: 'GET /api/health',
            feedback: 'GET /api/feedback, POST /api/feedback',
            admin: 'GET /api/admin/flagged, GET /api/admin/stats',
            moderation: 'PUT /api/admin/approve/:id, PUT /api/admin/reject/:id'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`?? Server is running!`);
    console.log(`?? URL: http://localhost:${PORT}`);
    console.log(`??  Health: http://localhost:${PORT}/api/health`);
    console.log(`?? Feedback: http://localhost:${PORT}/api/feedback`);
    console.log(`========================================`);
    console.log(`? Profanity filter active with ${badWords.length} words`);
    console.log(`========================================`);
});
