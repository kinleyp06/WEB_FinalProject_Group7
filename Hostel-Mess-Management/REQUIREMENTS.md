
## Hostel Mess Management System - Requirements

## User Roles

### Student
- [ ] View weekly meal plan
- [ ] Submit feedback with rating (1-5 stars)
- [ ] Submit meal suggestions
- [ ] Vote in special meal polls
- [ ] View my submission history
- [ ] Receive real-time notifications

### Admin
- [ ] Create/Edit/Delete meal plans
- [ ] Upload grocery bill receipts
- [ ] View cost summary charts
- [ ] Moderate flagged feedback
- [ ] Create special meal polls
- [ ] View poll results
- [ ] Send announcements

## Core Features (Priority Order)

### P0 (Must have)
1. Login/Registration with role separation
2. Meal plan display (student view)
3. Feedback submission form
4. Admin meal plan management

### P1 (Important)
5. Profanity filter on suggestions
6. Student history page
7. Grocery bill upload
8. Basic charts for costs

### P2 (Nice to have)
9. Real-time WebSocket notifications
10. Special meal polls
11. Advanced analytics


Create `API_DESIGN.md`:

# API Endpoints

## Authentication
- POST /api/auth/register - Create account
- POST /api/auth/login - Login (returns JWT)
- GET /api/auth/me - Get current user

## Meal Plans
- GET /api/meals - Get all meals
- POST /api/meals - Create meal (admin)
- PUT /api/meals/:id - Update meal (admin)
- DELETE /api/meals/:id - Delete meal (admin)

## Feedback
- POST /api/feedback - Submit feedback
- GET /api/feedback/my - Get my feedback history
- GET /api/feedback/pending - Get flagged feedback (admin)
- PUT /api/feedback/:id/moderate - Approve/reject (admin)

## Grocery Bills
- POST /api/bills/upload - Upload receipt (admin)
- GET /api/bills/summary - Get cost summary (admin)

## Polls
- GET /api/polls/active - Get active polls
- POST /api/polls/:id/vote - Cast vote
- GET /api/polls/:id/results - Get results

---