# Hostel Mess Management System - Implementation Report

A full-stack web application for managing hostel meal plans, student feedback, announcements, and administrative operations with a complete CI/CD pipeline.

## Table of Contents

- [Project Overview](#project-overview)
- [Tools and Technologies](#tools-and-technologies)
- [Features](#features)
- [Implementation Steps](#implementation-steps)
- [How It Works](#how-it-works)
- [System Architecture](#system-architecture)
- [Challenges Faced](#challenges-faced)
- [Deployment](#deployment)
- [Team](#team)

---

## Project Overview

The Hostel Mess Management System is a full-stack web application developed for the College of Science and Technology to streamline meal planning, student feedback management, announcements, and administrative operations.

**Module:** DSO101 - Continuous Integration and Continuous Deployment  
**Programme:** BE in Software Engineering  
**Group:** Group 7  
**Date:** May 2026  
**Status:** Production Ready

### Project Objectives

- Containerise the backend and frontend using Docker with Alpine base images
- Implement a GitHub Actions workflow that triggers on every push to main
- Automate deployment to Render for both backend and frontend services
- Manage all credentials securely using GitHub Secrets and environment variables
- Integrate with Neon cloud PostgreSQL as the external database service
- Ensure zero-downtime deployments through continuous integration

---

## Tools and Technologies

### Backend Technologies

| Component | Tool | Version | Purpose |
|-----------|------|---------|---------|
| Runtime | Node.js | 20+ | JavaScript execution environment |
| Framework | Express.js | 4.x | Web application framework |
| ORM | Prisma | 5.22 | Database abstraction layer |
| Authentication | JWT | 9.x | Token-based authentication |
| Password Hashing | bcryptjs | 2.4.3 | Secure password hashing |
| Validation | express-validator | 7.x | Request validation |
| CORS | cors | 2.8.5 | Cross-origin resource sharing |
| Env Management | dotenv | 16.x | Environment variable management |

### Frontend Technologies

| Component | Tool | Version | Purpose |
|-----------|------|---------|---------|
| Framework | Next.js | 20 | React meta-framework |
| Language | TypeScript | 5.x | Type-safe JavaScript |
| UI Library | React | 19.x | Component-based UI |
| HTTP Client | Axios | 1.x | API communication |
| State Management | Zustand | 4.x | Global state management |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework |
| CSS Processing | PostCSS | 8.x | CSS transformation tool |

### DevOps Technologies

| Tool | Purpose | Version |
|------|---------|---------|
| Docker | Container orchestration | Latest |
| Docker Compose | Multi-container management | Latest |
| GitHub Actions | CI/CD automation | Built-in |
| Render | Cloud deployment platform | Latest |
| Neon | Serverless PostgreSQL | Cloud |
| Git | Version control | Latest |

### Database

| Aspect | Technology | Details |
|--------|-----------|---------|
| Database Type | PostgreSQL | Relational database |
| Provider | Neon | Serverless cloud database |
| ORM | Prisma | Type-safe database client |
| Connection Pooling | Neon Pooler | Connection pool management |
| Region | AWS US East 1 | N. Virginia |

---

## Features

### Student Features

#### 1. View Meal Plans
- Browse upcoming meal schedules
- See meal details and descriptions
- Access meal information organized by date
- Filter meals by type (breakfast, lunch, dinner)
- View flagged or problematic meals

#### 2. Submit Feedback
- Rate meal quality on a 5-star scale
- Add detailed comments about meals
- Track feedback submission status
- Receive responses from administrators
- View feedback history

#### 3. Make Suggestions
- Submit improvement suggestions for hostel services
- Add detailed descriptions and attachments
- Track suggestion status (pending, approved, implemented)
- Receive acknowledgment notifications

#### 4. Vote in Polls
- Participate in hostel surveys and polls
- View real-time poll results
- Multiple choice voting options
- View past poll results and statistics

#### 5. View Announcements
- Read important hostel announcements
- Get real-time notifications for new announcements
- Access announcement history
- Filter announcements by category

### Administrator Features

#### 1. Manage Meal Plans
- Create and update meal schedules
- Set meal types and detailed descriptions
- Flag problematic or cancelled meals
- Manage meal inventory and quantities
- Generate meal planning reports

#### 2. Post Announcements
- Create and publish announcements
- Target specific audience groups
- Schedule announcement publishing
- Archive past announcements
- Send real-time push notifications

#### 3. Manage Financial Records
- Record expenses and income
- Categorize transactions
- Generate financial reports and analytics
- Track budget allocations and spending
- Export financial data

#### 4. Respond to Feedback
- View all student feedback and ratings
- Respond to feedback comments
- Mark feedback as resolved or pending
- Generate feedback analytics and trends
- Track common feedback patterns

#### 5. Create and Manage Polls
- Design surveys and polls with multiple options
- Set voting deadlines
- View live voting results in real-time
- Export poll data and results
- Archive completed polls

#### 6. Monitor Suggestions
- Review all student suggestions
- Update suggestion status
- Implement improvements based on suggestions
- Track implementation progress
- Provide feedback to students

---

## Implementation Steps

### Phase 1: Project Setup and Planning (Week 1-2)

#### Step 1: Project Initialization
- Created GitHub repository for version control
- Set up project folder structure
- Initialized Node.js backend project
- Initialized Next.js frontend project
- Configured git workflows and branch protection

#### Step 2: Database Design
- Designed database schema using Prisma
- Defined entities: Users, Meals, Feedback, Announcements, Polls, Suggestions, Finance
- Established relationships between entities
- Planned migration strategy

#### Step 3: Environment Setup
- Created local development environment configuration
- Set up `.env` files for backend and frontend
- Configured database connection parameters
- Set up authentication secrets

### Phase 2: Backend Development (Week 3-5)

#### Step 1: Express Server Setup
- Initialized Node.js project with npm
- Installed required dependencies
- Created Express server entry point
- Configured CORS for frontend communication
- Set up middleware for request processing

#### Step 2: Database Configuration
- Integrated Prisma ORM
- Created database schema with all entities
- Configured PostgreSQL connection
- Set up connection pooling for production

#### Step 3: Authentication System
- Implemented JWT token generation
- Created user registration endpoint
- Created user login endpoint
- Set up password hashing with bcryptjs (10 salt rounds)
- Configured authentication middleware
- Set token expiry to 7 days

#### Step 4: API Routes Development
- Created authentication routes (login, register)
- Developed meal management endpoints
- Built feedback submission and retrieval endpoints
- Implemented announcement management routes
- Created poll voting and results endpoints
- Built suggestion submission endpoints
- Developed finance record endpoints

#### Step 5: Input Validation
- Integrated express-validator library
- Added validation rules for all endpoints
- Implemented error handling and responses

#### Step 6: Role-Based Access Control
- Implemented STUDENT and ADMIN roles
- Created authorization middleware
- Protected admin-only endpoints
- Configured role-specific operations

### Phase 3: Frontend Development (Week 6-8)

#### Step 1: Next.js Project Setup
- Created Next.js 20 project with TypeScript
- Configured Next.js configuration file
- Set up folder structure for pages and components
- Integrated Tailwind CSS for styling

#### Step 2: Authentication State Management
- Implemented Zustand store for authentication
- Created authentication context
- Managed user session and tokens
- Stored JWT tokens in localStorage

#### Step 3: API Client Setup
- Created Axios instance with base URL configuration
- Implemented API interceptor for automatic token attachment
- Configured error handling for API calls
- Set up request/response transformation

#### Step 4: Pages and Components
- Created layout component with navigation
- Built student dashboard
- Built admin dashboard
- Created meal view components
- Developed feedback submission components
- Built announcement display components
- Created poll voting interface
- Implemented suggestion submission form

#### Step 5: Real-time Features
- Integrated WebSocket for real-time updates
- Implemented live notification system
- Set up automatic data refresh

### Phase 4: Docker Configuration (Week 9-10)

#### Step 1: Backend Dockerfile
- Created Dockerfile for Node.js backend
- Used Alpine base image (node:20-alpine)
- Configured working directory and dependencies
- Generated Prisma client during build
- Optimized for production deployment

#### Step 2: Frontend Dockerfile
- Created Dockerfile for Next.js frontend
- Used Alpine base image (node:20-alpine)
- Set up build arguments for API URL
- Configured production server startup

#### Step 3: Docker Compose
- Created docker-compose.yml for local development
- Configured multi-container setup
- Set up environment variables for containers
- Configured volume mounts for development

### Phase 5: CI/CD Pipeline Implementation (Week 11-12)

#### Step 1: GitHub Actions Workflow Setup
- Created `.github/workflows/ci-cd.yml`
- Configured workflow triggers (push to main)
- Set up job for backend CI validation
- Set up job for frontend CI validation
- Created Docker image build jobs
- Implemented deployment jobs with Render webhooks

#### Step 2: GitHub Secrets Configuration
- Added NEXT_PUBLIC_API_URL as secret
- Added RENDER_BACKEND_DEPLOY_HOOK as secret
- Added RENDER_FRONTEND_DEPLOY_HOOK as secret
- Ensured no sensitive data in workflow files

#### Step 3: Workflow Stages
- Backend CI: Installs dependencies, validates Prisma client generation
- Frontend CI: Installs dependencies, builds Next.js application
- Docker Build: Builds and validates Docker images
- Deploy: Triggers Render deployment hooks on successful build

### Phase 6: Deployment to Render (Week 12-13)

#### Step 1: Backend Deployment
- Created Web Service on Render
- Connected GitHub repository
- Set build command: npm install && npx prisma generate
- Set start command: npm start
- Configured environment variables on Render dashboard
- Enabled automatic deployment via GitHub Actions webhooks

#### Step 2: Frontend Deployment
- Created Web Service on Render for frontend
- Connected GitHub repository
- Set build command: npm install && npm run build
- Set start command: npm start
- Configured NEXT_PUBLIC_API_URL pointing to backend
- Enabled automatic deployment

#### Step 3: Database Migration
- Set up Neon PostgreSQL instance
- Obtained connection string (DATABASE_URL)
- Applied Prisma migrations to production database
- Verified database schema synchronization

#### Step 4: Environment Configuration
- Set DATABASE_URL in Render backend environment
- Set JWT_SECRET in Render backend environment
- Set FRONTEND_URL in Render backend for CORS
- Set NEXT_PUBLIC_API_URL in Render frontend

### Phase 7: Testing and Debugging (Week 13-14)

#### Step 1: Local Testing
- Tested authentication flow
- Tested all API endpoints
- Tested frontend components
- Tested Docker containers locally

#### Step 2: Production Testing
- Verified deployments on Render
- Tested database connectivity
- Tested API response times
- Tested frontend loading and functionality

#### Step 3: Debugging Issues
- Resolved environment variable issues
- Fixed database connection problems
- Addressed CORS configuration issues
- Optimized cold start times

### Phase 8: Documentation (Week 14-15)

#### Step 1: Code Documentation
- Added inline comments to complex logic
- Documented API endpoints
- Created setup instructions
- Documented environment variables

#### Step 2: Project Report
- Created comprehensive README
- Documented architecture and design
- Created deployment guide
- Prepared presentation materials

---

## How It Works

### Authentication Flow

1. **User Registration**
   - Student enters name, email, and password
   - System validates input using express-validator
   - Password is hashed using bcryptjs with 10 salt rounds
   - User record created in database
   - User redirected to login page

2. **User Login**
   - Student enters email and password
   - System retrieves user from database
   - Password is compared with stored hash using bcryptjs
   - If valid, JWT token is generated with 7-day expiry
   - Token is sent to frontend and stored in localStorage
   - User is redirected to dashboard

3. **Token Usage**
   - Frontend stores JWT token in localStorage
   - Axios interceptor automatically attaches token to all requests
   - Backend middleware verifies token on protected routes
   - If token invalid or expired, user is redirected to login

### Meal Plan Management

1. **Admin Creates Meal Plan**
   - Administrator logs in to admin dashboard
   - Navigates to meal management section
   - Enters meal date, type, and description
   - Submits form to backend API
   - Backend validates input and stores in database
   - Frontend updates to show new meal

2. **Student Views Meal Plan**
   - Student logs in to student dashboard
   - Browses meal plans organized by date
   - Can filter by meal type
   - Sees meal details and descriptions

3. **Admin Flags Problematic Meal**
   - Administrator marks meal as flagged (cancelled)
   - Flag status is updated in database
   - Student sees meal with warning indicator
   - System may send notification about change

### Feedback Submission Flow

1. **Student Submits Feedback**
   - Student navigates to feedback section
   - Selects a meal to provide feedback on
   - Rates meal quality (1-5 stars)
   - Adds optional comment
   - Submits feedback form
   - Backend stores feedback in database

2. **Administrator Reviews Feedback**
   - Administrator views feedback dashboard
   - Sees all student feedback and ratings
   - Can filter by meal or date
   - Reviews comments and suggestions

3. **Administrator Responds**
   - Administrator writes response to feedback
   - Updates feedback status to "resolved"
   - Response is sent to student
   - Student receives notification

### Poll Voting

1. **Administrator Creates Poll**
   - Administrator navigates to polls section
   - Creates new poll with question and options
   - Sets poll options (e.g., "Yes", "No", "Maybe")
   - Saves poll to database

2. **Student Votes**
   - Student sees poll in announcements
   - Selects their preferred option
   - Submits vote
   - Backend updates vote count in database

3. **View Results**
   - System displays real-time poll results
   - Shows vote count and percentage for each option
   - Results update as more votes come in

### Announcement System

1. **Administrator Posts Announcement**
   - Administrator navigates to announcements section
   - Writes announcement title and content
   - Sets publish date and time
   - Submits announcement
   - Backend stores announcement in database

2. **Students Receive Announcement**
   - System sends real-time notification to all students
   - Announcement appears in student feed
   - Students can view announcement details

### Suggestion System

1. **Student Submits Suggestion**
   - Student navigates to suggestions section
   - Enters suggestion title and description
   - Submits form
   - Backend stores suggestion with "pending" status

2. **Administrator Reviews**
   - Administrator views suggestion dashboard
   - Reviews student suggestions
   - Updates status (approved, implemented, rejected)

3. **Student Receives Update**
   - Student gets notification when suggestion status changes
   - Can view admin response or implementation status

### Finance Management

1. **Administrator Records Transaction**
   - Administrator navigates to finance section
   - Enters transaction details (amount, category, description)
   - Saves transaction
   - Backend stores in database

2. **View Financial Records**
   - Administrator can view all transactions
   - Filter by category, date, or amount
   - Generate financial reports
   - Export data for analysis

---

## System Architecture

### Three-Tier Architecture

#### Presentation Layer (Frontend)
- Next.js application running on Render
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- Communicates with backend via REST API

#### Application Layer (Backend)
- Express.js server running on Render
- Handles business logic and data processing
- Validates all incoming requests
- Implements authentication and authorization
- Manages API endpoints

#### Data Layer (Database)
- Neon PostgreSQL database
- Prisma ORM for database operations
- Connection pooling for performance
- Secure connection strings via environment variables

### Data Flow

1. **Client Request**
   - Frontend sends HTTP request with JWT token
   - Axios interceptor adds token to Authorization header
   - Request routed to appropriate backend endpoint

2. **Server Processing**
   - Express middleware validates JWT token
   - Request validation middleware checks input
   - Authorization middleware checks user role
   - Route handler processes business logic
   - Prisma client communicates with database

3. **Database Operation**
   - Prisma translates ORM operations to SQL
   - Query executed on Neon PostgreSQL
   - Results returned to application

4. **Response**
   - Backend sends JSON response to frontend
   - Frontend receives response and updates state
   - Component re-renders with new data

---

## Challenges Faced

### Challenge 1: Database URL Connection Issue

**Problem:**
Prisma could not find the DATABASE_URL environment variable on Render deployment, causing connection failures.

**Root Cause:**
The environment variable was saved as "Database_URL" (mixed case) instead of "DATABASE_URL" (uppercase). Environment variables are case-sensitive.

**Solution:**
- Corrected the environment variable name to "DATABASE_URL" in Render dashboard
- Verified spelling and case sensitivity
- Redeployed backend service
- Connection established successfully

**Learning:**
Environment variable names must match exactly, including case sensitivity.

---

### Challenge 2: Large Repository Size

**Problem:**
Git push operations were timing out with error: "repository exceeds 455MB". Deployment was failing due to large repository size.

**Root Cause:**
The `node_modules` directory and `.next` build folder were not included in `.gitignore`. These directories contain thousands of files and are very large.

**Solution:**
- Added `node_modules/` and `.next/` to `.gitignore`
- Removed these directories from git history using `git rm -r --cached`
- Committed the updated `.gitignore`
- Repository size reduced significantly
- Git push and deployment now works smoothly

**Learning:**
Dependencies should never be committed to git. They should be installed fresh during deployment.

---

### Challenge 3: Render Cold Start Delays

**Problem:**
First request to backend after deployment would take 30-40 seconds due to cold start on Render's free tier.

**Root Cause:**
Render's free tier spins down inactive services. When a request comes in, the container needs to start up and initialize.

**Solution:**
- Added loading spinner and loading state on frontend
- Implemented timeout handling for slow responses
- Optimized backend startup time
- User experience improved with visual feedback during wait

**Learning:**
Cold starts are inevitable on serverless/free tier platforms. Frontend should handle slow responses gracefully.

---

### Challenge 4: Neon Database Connection Locally

**Problem:**
Prisma could not connect to Neon database when developing locally. Connection timeout errors appeared.

**Root Cause:**
Local development machine was using the Neon pooler URL which has firewall restrictions for local connections.

**Solution:**
- Identified that Neon provides two connection URLs: direct and pooler
- Switched to direct connection URL for local development
- Used pooler URL on Render for better connection pooling
- Connection established successfully both locally and in production

**Learning:**
Pooled connections are for server-side use. Direct connections are needed for local development.

---

### Challenge 5: GitHub Actions Workflow Not Triggering

**Problem:**
GitHub Actions workflow was not triggering on push to main branch. No jobs were running.

**Root Cause:**
The `.github/workflows/ci-cd.yml` file was created with 0 bytes due to copy-paste error.

**Solution:**
- Deleted the malformed workflow file
- Recreated the workflow file directly on GitHub's UI
- Copied workflow content directly into GitHub editor
- Committed the corrected workflow
- Subsequent pushes now trigger the workflow successfully

**Learning:**
Always verify that files are created with content, not as empty files.

---

### Challenge 6: CORS Errors in Production

**Problem:**
Frontend on Render could not communicate with backend on Render. CORS (Cross-Origin Resource Sharing) errors appeared in browser console.

**Root Cause:**
Backend was configured with `FRONTEND_URL=http://localhost:3000` but frontend was deployed at a different Render URL.

**Solution:**
- Updated FRONTEND_URL environment variable on Render backend to exact frontend deployment URL
- Reconfigured CORS middleware to accept requests from correct origin
- Redeployed backend service
- CORS errors resolved

**Learning:**
CORS origin must match exactly. Environment variables must be environment-specific.

---

### Challenge 7: TypeScript Configuration Error

**Problem:**
Next.js build was failing with error: "next.config.ts is not supported"

**Root Cause:**
Global Next.js installation was outdated and did not support TypeScript config files.

**Solution:**
- Uninstalled global Next.js
- Updated local Next.js to latest version (20+)
- Next.js now supports TypeScript configuration files
- Build completed successfully

**Learning:**
Always use local dependencies instead of global installations. Global tools can cause version conflicts.

---

### Challenge 8: Prisma Client Generation

**Problem:**
Backend deployment would fail if Prisma client was not generated before Docker image creation.

**Root Cause:**
Prisma client is generated based on schema.prisma file. If schema changes, client needs regeneration.

**Solution:**
- Added `npx prisma generate` to backend Dockerfile
- Also added it to Render build command: `npm install && npx prisma generate`
- Ensures fresh Prisma client is generated on every deployment

**Learning:**
Prisma client must be generated for every build when schema might change.

---

### Challenge 9: Environment Variables in Frontend Build

**Problem:**
Frontend environment variables like NEXT_PUBLIC_API_URL were not available at runtime.

**Root Cause:**
Next.js requires environment variables to be injected at build time, not runtime.

**Solution:**
- Used build arguments in Docker to pass NEXT_PUBLIC_API_URL
- Set environment variables before build in Render
- Frontend now has correct API URL injected at build time

**Learning:**
Frontend environment variables are baked into the build. Backend environment variables are read at runtime.

---

### Challenge 10: JWT Token Expiry

**Problem:**
Users were getting logged out frequently on production, even when actively using the application.

**Root Cause:**
JWT token was set to expire after 7 days. No token refresh mechanism was implemented.

**Solution:**
- Kept 7-day expiry for security
- Implemented token refresh logic on frontend
- Auto-refresh token before expiry when making requests
- Users stay logged in for longer periods

**Learning:**
Long token expiry improves UX but reduces security. Implement refresh token mechanism for balance.

---

### Challenge 11: HTTPS and SSL Certificate

**Problem:**
Mixed content warnings in browser when frontend (HTTPS on Render) tried to access backend (initially HTTP).

**Root Cause:**
Render automatically issues SSL certificates. Frontend was using HTTPS but trying to access HTTP backend.

**Solution:**
- Ensured backend also uses HTTPS on Render
- Updated NEXT_PUBLIC_API_URL to use HTTPS
- Mixed content warnings resolved

**Learning:**
Always use HTTPS in production for security.

---

### Challenge 12: Database Migration in Production

**Problem:**
Needed to apply database schema changes to production without data loss.

**Root Cause:**
Production database contains real data. Schema changes must be carefully managed.

**Solution:**
- Used Prisma migrations: `npx prisma migrate deploy`
- Created meaningful migration names for tracking
- Tested migrations on local copy first
- Applied migrations to production Neon database
- No data loss occurred

**Learning:**
Always test migrations locally before applying to production.

---

## Deployment

### Render Backend Deployment

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm start` |
| Port | 5000 |
| Auto Deploy | Enabled via GitHub Actions webhook |
| Environment | Production |

**Environment Variables:**
- DATABASE_URL: Neon PostgreSQL connection string
- JWT_SECRET: Secret key for signing JWT tokens
- PORT: Server port (5000)
- FRONTEND_URL: Allowed CORS origin
- NODE_ENV: Set to production

### Render Frontend Deployment

| Setting | Value |
|---------|-------|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Port | 3000 |
| Auto Deploy | Enabled via GitHub Actions webhook |
| Environment | Production |
| Live URL | https://hostel-mess-frontend.onrender.com |

**Environment Variables:**
- NEXT_PUBLIC_API_URL: Backend API URL

### Neon PostgreSQL Setup

| Setting | Value |
|---------|-------|
| Provider | Neon (neon.tech) |
| Type | Serverless PostgreSQL |
| Region | AWS US East 1 |
| Connection Type | Pooled (for production) |
| Migrations | 4 migrations applied |

**Migrations Applied:**
1. Initial schema (users, meals, feedback, announcements)
2. Add flagged status to meals
3. Add polls table
4. Add grocery bills table

---

## Security Measures

### Authentication & Authorization

- JWT tokens with 7-day expiry
- Password hashing with bcryptjs (10 salt rounds)
- Role-based access control (STUDENT and ADMIN)
- Protected endpoints require valid token
- Admin endpoints require ADMIN role

### Data Protection

- .env files in .gitignore (never committed)
- Credentials stored in GitHub Secrets for CI/CD
- Environment variables for sensitive data
- No hardcoded secrets in codebase
- HTTPS enforced on all connections

### Input Validation

- express-validator on all backend routes
- Input sanitization
- SQL injection prevention through Prisma ORM
- XSS protection through React's built-in escaping

### Network Security

- CORS configured for specific origin only
- HTTPS enforced in production
- Alpine base images reduce attack surface
- Minimal dependencies in production builds

---

## GitHub Actions Workflow

The CI/CD pipeline runs on every push to the main branch:

1. **Checkout**: Clone repository code
2. **Backend CI**: Install dependencies, generate Prisma client, validate build
3. **Frontend CI**: Install dependencies, build Next.js application
4. **Docker Build**: Build backend and frontend Docker images
5. **Deploy**: Trigger Render webhooks for automatic deployment

All stages must pass before deployment occurs. This ensures broken code never reaches production.

---

## Local Development Setup

### Prerequisites

- Node.js 20 or higher
- Git
- Docker (optional)

### Backend Setup

1. Navigate to backend directory
2. Copy .env.example to .env
3. Update DATABASE_URL with local PostgreSQL
4. Run `npm install`
5. Run `npx prisma migrate deploy`
6. Run `npm run dev`

### Frontend Setup

1. Navigate to frontend directory
2. Copy .env.example to .env.local
3. Set NEXT_PUBLIC_API_URL to http://localhost:5000
4. Run `npm install`
5. Run `npm run dev`

### Docker Setup

1. Run `docker-compose up -d`
2. Backend available at http://localhost:5000
3. Frontend available at http://localhost:3000

---

## Team

| Member | Role | Responsibilities |
|--------|------|------------------|
| Pelden Nidup | Developer | Render backend and frontend deployment |
| Kinley Pem | DevOps Lead | Docker configuration for backend and frontend |
| Tshering Tenzin | CI/CD Engineer | GitHub Actions workflow setup |
| Yeshi Lhendrup | Security Lead | GitHub Secrets configuration |
| Sonam Wangmo | Database Admin | Neon database setup and migrations |

**Tutor:** Mr. Ashish Chhetri

---

## Project Links

- **GitHub Repository:** https://github.com/kinleyp06/WEB_FinalProject_Group7
- **Frontend URL:** https://hostel-mess-frontend.onrender.com
- **Backend URL:** https://hostel-mess-backend-1fq4.onrender.com

---

## References

- Express.js Documentation: https://expressjs.com/
- Next.js Documentation: https://nextjs.org/docs
- Prisma ORM: https://www.prisma.io/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Docker: https://docs.docker.com/
- GitHub Actions: https://docs.github.com/en/actions
- Render Documentation: https://render.com/docs
- Neon Documentation: https://neon.tech/docs

---

**Last Updated:** May 2026  
**Status:** Production Ready  
**Version:** 1.0.0