"use client";

import { useState } from 'react';
import { AlertCircle, CheckCircle, Send, Star } from 'lucide-react';

// Profanity words for client-side checking (same as backend)
const badWords = ['shit', 'fuck', 'damn', 'stupid', 'idiot', 'hate', 'crap', 'asshole', 'bitch'];

function containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word));
}

function getFlaggedWords(text: string): string[] {
    const lowerText = text.toLowerCase();
    return badWords.filter(word => lowerText.includes(word));
}

export default function FeedbackForm() {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [profanityWarning, setProfanityWarning] = useState(false);
    const [flaggedWords, setFlaggedWords] = useState<string[]>([]);

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setComment(value);
        
        // Real-time profanity check (frontend validation)
        const hasProfanity = containsProfanity(value);
        const words = getFlaggedWords(value);
        
        setProfanityWarning(hasProfanity);
        setFlaggedWords(words);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        
        if (!comment.trim()) {
            alert('Please enter your feedback');
            return;
        }
        
        setSubmitting(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': application/json',
                },
                body: JSON.stringify({
                    rating,
                    comment,
                    mealType: 'LUNCH'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setSubmitted(true);
                if (data.status === 'FLAGGED') {
                    alert(`?? Feedback flagged: ${data.message}`);
                } else {
                    alert('? Feedback submitted successfully!');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        setComment('');
        setRating(0);
        setProfanityWarning(false);
        setFlaggedWords([]);
    };

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h3>
                <p className="text-green-600 mb-4">Your feedback has been submitted.</p>
                <button
                    onClick={handleReset}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                    Submit Another Feedback
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating Stars */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${
                                    star <= (hoverRating || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    {rating > 0 ? `You selected ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
                </p>
            </div>

            {/* Feedback Comment */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback *
                </label>
                <textarea
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Share your thoughts about today's meal..."
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                        profanityWarning
                            ? 'border-red-400 bg-red-50 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                />
                
                {/* Real-time Profanity Warning */}
                {profanityWarning && (
                    <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-700">
                                Inappropriate language detected
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                                Please avoid using: {flaggedWords.join(', ')}
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                                ?? Your feedback will be reviewed by admin before being published.
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Character counter */}
                <p className={`text-xs mt-1 ${comment.length > 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                    {comment.length} characters
                </p>
            </div>

            {/* Meal Type Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Type
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="BREAKFAST">Breakfast</option>
                    <option value="LUNCH" selected>Lunch</option>
                    <option value="DINNER">Dinner</option>
                    <option value="SNACKS">Snacks</option>
                </select>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting || rating === 0 || !comment.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
                {submitting ? (
                    'Submitting...'
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                    </>
                )}
            </button>

            {/* Info Note */}
            <p className="text-xs text-gray-400 text-center">
                All feedback is moderated. Inappropriate content will be flagged for review.
            </p>
        </form>
    );
}
