const { containsProfanity, getFlaggedWords } = require('../utils/profanityList');

// Middleware to check feedback content
function checkFeedbackProfanity(req, res, next) {
  const { comment } = req.body;
  
  if (!comment) {
    req.body.isFlagged = false;
    req.body.status = 'PENDING';
    return next();
  }
  
  const { hasProfanity } = containsProfanity(comment);
  
  if (hasProfanity) {
    req.body.isFlagged = true;
    req.body.flaggedWords = getFlaggedWords(comment);
    req.body.status = 'FLAGGED';
    console.log('⚠️ Profanity detected in feedback');
  } else {
    req.body.isFlagged = false;
    req.body.status = 'PENDING';
  }
  
  next();
}

// Middleware for suggestions
function checkSuggestionProfanity(req, res, next) {
  const { title, description } = req.body;
  const fullText = title + ' ' + (description || '');
  
  const { hasProfanity } = containsProfanity(fullText);
  
  if (hasProfanity) {
    req.body.isFlagged = true;
    req.body.flaggedWords = getFlaggedWords(fullText);
    req.body.status = 'FLAGGED';
  } else {
    req.body.isFlagged = false;
    req.body.status = 'PENDING';
  }
  
  next();
}

module.exports = { checkFeedbackProfanity, checkSuggestionProfanity };