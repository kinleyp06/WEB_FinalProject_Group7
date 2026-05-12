const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all flagged content
async function getFlaggedContent(req, res) {
  try {
    const flaggedFeedback = await prisma.feedback.findMany({
      where: { status: { in: ['PENDING', 'FLAGGED'] } },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: flaggedFeedback
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Get moderation statistics
async function getModerationStats(req, res) {
  try {
    const total = await prisma.feedback.count();
    const pending = await prisma.feedback.count({ where: { status: 'PENDING' } });
    const flagged = await prisma.feedback.count({ where: { status: 'FLAGGED' } });
    const approved = await prisma.feedback.count({ where: { status: 'APPROVED' } });
    
    res.json({
      success: true,
      data: { total, pending, flagged, approved }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = { getFlaggedContent, getModerationStats };