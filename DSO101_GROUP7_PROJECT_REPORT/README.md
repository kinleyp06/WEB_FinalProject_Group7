# CI/CD Pipeline for Hostel Mess Management System

## College of Science and Technology

Rinchending, Bhutan

---

## DSO101 - Continuous Integration and Continuous Deployment

Final Project Report

**CI/CD Pipeline for Hostel Mess Management System**

| Module    | DSO101 - CI/CD             |
| --------- | -------------------------- |
| Programme | BE in Software Engineering |
| Group     | Group 7                    |
| Date      | May 2026                   |

### Team Members

- Pelden Nidup
- Kinley Pem
- Tshering Tenzin
- Yeshi Lhendrup
- Sonam Wangmo

**Tutor:** Mr. Ashish Chhetri

### Project Links

- **GitHub Repository:** github.com/kinleyp06/WEB_FinalProject_Group7
- **Frontend URL:** https://hostel-mess-frontend.onrender.com
- **Backend URL:** https://hostel-mess-backend-1fq4.onrender.com

---

## Introduction

The Hostel Mess Management System is a full-stack web application designed for the College of Science and Technology. It allows students to view meal plans, submit feedback, make suggestions, vote in polls, and view announcements. Administrators manage meal plans, announcements, finance records, and respond to student feedback.

This report covers the DevOps implementation of containerising the application using Docker and automating deployment through a GitHub Actions CI/CD pipeline. The backend is deployed on Render, the frontend on Render, and the database on Neon (cloud PostgreSQL).

---

## Aim and Objectives

The aim is to implement a complete CI/CD pipeline for the Hostel Mess Management System so that every code change is automatically tested, built, and deployed to production without manual steps.

### Objectives

- Containerise the backend and frontend using Docker with Alpine base images
- Implement a GitHub Actions workflow that triggers on every push to main
- Automate deployment to Render for both backend and frontend services
- Manage all credentials securely using GitHub Secrets and environment variables
- Integrate with Neon cloud PostgreSQL as the external database service

---

## Feasibility

All tools used are free and well documented. GitHub Actions is built into the existing GitHub repository with no extra setup needed. Render offers a free tier for web services sufficient for the project scale. Neon provides a free serverless PostgreSQL instance. The team had prior exposure to these tools through DSO101 practicals.

---

## Expected Outcome

| Deliverable                | Acceptance Criteria                                       |
| -------------------------- | --------------------------------------------------------- |
| Backend Dockerfile         | Builds successfully, container runs on port 5000          |
| Frontend Dockerfile        | Builds successfully, Next.js served on port 3000          |
| GitHub Actions Workflow    | Green checkmark on every push to main branch              |
| Render Backend Deployment  | Backend live and accessible via public URL                |
| Render Frontend Deployment | Frontend live and accessible via public URL               |
| Neon Database              | PostgreSQL tables migrated and accessible from backend    |
| GitHub Secrets             | All credentials stored as secrets, none hardcoded in code |

---

## Implementation Overview

### GitHub Actions Workflow

![GitHub Actions Workflow](./DSO101_GROUP7_PROJECT_REPORT.assets/page-3-img-0.png)

### Render Backend Deployment

![Render Backend](./DSO101_GROUP7_PROJECT_REPORT.assets/page-3-img-1.png)

### Render Frontend Deployment

![Render Frontend](./DSO101_GROUP7_PROJECT_REPORT.assets/page-3-img-2.png)

### GitHub Secrets

![GitHub Secrets](./DSO101_GROUP7_PROJECT_REPORT.assets/page-3-img-3.png)

---

## Work Plan

| Task                              | Member          | Week       |
| --------------------------------- | --------------- | ---------- |
| Backend Dockerfile                | Kinley Pem      | Week 10    |
| Frontend Dockerfile               | Kinley Pem      | Week 10    |
| GitHub Actions workflow setup     | Tshering Tenzin | Week 11    |
| Render backend deployment         | Pelden Nidup    | Week 12    |
| Render frontend deployment        | Pelden Nidup    | Week 12    |
| Neon database setup and migration | Sonam Wangmo    | Week 12    |
| GitHub Secrets configuration      | Yeshi Lhendrup  | Week 12    |
| Testing and debugging pipeline    | All             | Week 13    |
| Documentation                     | All             | Week 14-15 |

### Timeline (March - May 2026)

The project was executed over a 13-week period from March through May 2026, with tasks distributed across team members according to the schedule above.

---

## Implementation Review

### Docker Configuration & Optimization

#### Backend Dockerfile

A single-stage build is used with a lightweight Alpine base image. The Prisma client is generated during the build step and only production-relevant files are copied.

![Backend Dockerfile](./DSO101_GROUP7_PROJECT_REPORT.assets/page-5-img-0.png)

#### Frontend Dockerfile

The frontend uses Next.js and is served as a Node.js server process. The Dockerfile installs dependencies, accepts the API URL as a build argument, builds the Next.js application, and starts the production server.

![Frontend Dockerfile](./DSO101_GROUP7_PROJECT_REPORT.assets/page-5-img-1.png)

#### Optimization Summary

| Optimization                | Approach                                                         |
| --------------------------- | ---------------------------------------------------------------- |
| Smaller image size          | Alpine base images for both backend and frontend                 |
| Prisma client pre-generated | npx prisma generate runs during Docker build                     |
| Secrets not in image        | .env excluded via .gitignore; passed via environment variables   |
| Build argument for API URL  | NEXT_PUBLIC_API_URL passed as ARG so it can vary per environment |

---

## CI/CD Pipeline Design

GitHub Actions was chosen because it is built into the GitHub repository and requires no additional setup. The pipeline triggers on every push to the main branch and runs through the following stages:

| Stage            | Description                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Backend CI       | Checks out code, installs dependencies, generates Prisma client, checks for syntax errors |
| Frontend CI      | Checks out code, installs dependencies, builds Next.js app to verify compilation          |
| Docker Build     | Builds backend and frontend Docker images to verify Dockerfiles are valid                 |
| Deploy to Render | Triggers deploy hooks for both backend and frontend services on Render                    |

The building steps ensure broken code never reaches production. Docker images are built to validate the Dockerfiles. Deployment only runs if all previous jobs pass. Credentials are passed via GitHub Secrets so nothing sensitive is exposed in the workflow file.

### Backend CI

![Backend CI](./DSO101_GROUP7_PROJECT_REPORT.assets/page-6-img-0.png)

### Frontend CI

![Frontend CI](./DSO101_GROUP7_PROJECT_REPORT.assets/page-7-img-0.png)

### Docker Build

![Docker Build](./DSO101_GROUP7_PROJECT_REPORT.assets/page-7-img-1.png)

### Deploy to Render

![Deploy to Render](./DSO101_GROUP7_PROJECT_REPORT.assets/page-7-img-2.png)

---

## Pipeline Implementation

The full GitHub Actions workflow file is located at `.github/workflows/ci-cd.yml`:

![Workflow Part 1](./DSO101_GROUP7_PROJECT_REPORT.assets/page-8-img-0.png)

![Workflow Part 2](./DSO101_GROUP7_PROJECT_REPORT.assets/page-8-img-1.png)

![Workflow Part 3](./DSO101_GROUP7_PROJECT_REPORT.assets/page-8-img-2.png)

![Workflow Part 4](./DSO101_GROUP7_PROJECT_REPORT.assets/page-8-img-3.png)

---

## Integration with External Services

### Render (Backend)

The backend is deployed as a Web Service on Render, connected to the GitHub repository. It auto-deploys on every push to main via a deploy hook triggered by the GitHub Actions pipeline.

| Setting       | Value                                                |
| ------------- | ---------------------------------------------------- |
| Build Command | npm install && npx prisma generate                   |
| Start Command | npm start                                            |
| Auto Deploy   | On every push to main via GitHub Actions deploy hook |

#### Build Command

![Build Command](./DSO101_GROUP7_PROJECT_REPORT.assets/page-9-img-0.png)

#### Start Command

![Start Command](./DSO101_GROUP7_PROJECT_REPORT.assets/page-9-img-1.png)

#### Auto Deploy

![Auto Deploy](./DSO101_GROUP7_PROJECT_REPORT.assets/page-9-img-2.png)

#### Environment Variables

![Environment Variables Backend](./DSO101_GROUP7_PROJECT_REPORT.assets/page-9-img-3.png)

Environment Variables Set via Render dashboard:

- DATABASE_URL
- JWT_SECRET
- PORT
- FRONTEND_URL

### Render (Frontend)

The frontend is also deployed as a Web Service on Render. Next.js runs as a Node.js server process.

| Setting              | Value                                                |
| -------------------- | ---------------------------------------------------- |
| Build Command        | npm install && npm run build                         |
| Start Command        | npm start                                            |
| Auto Deploy          | On every push to main via GitHub Actions deploy hook |
| Environment Variable | NEXT_PUBLIC_API_URL set to Render backend URL        |
| Live URL             | https://hostel-mess-frontend.onrender.com            |

#### Build Command

![Frontend Build Command](./DSO101_GROUP7_PROJECT_REPORT.assets/page-10-img-0.png)

#### Start Command

![Frontend Start Command](./DSO101_GROUP7_PROJECT_REPORT.assets/page-10-img-1.png)

#### Auto Deploy

![Frontend Auto Deploy](./DSO101_GROUP7_PROJECT_REPORT.assets/page-10-img-2.png)

#### Environment Variables

![Environment Variables Frontend](./DSO101_GROUP7_PROJECT_REPORT.assets/page-10-img-3.png)

---

## Neon (PostgreSQL Database)

The backend connects to a Neon serverless PostgreSQL instance using the DATABASE_URL environment variable. Prisma is used as the ORM. Database migrations were applied using npx prisma migrate deploy before the first deployment.

| Setting    | Value                                                             |
| ---------- | ----------------------------------------------------------------- |
| Provider   | Neon (neon.tech) - serverless PostgreSQL                          |
| ORM        | Prisma 5.22                                                       |
| Connection | Pooled connection via Neon pooler URL                             |
| Migrations | 4 migrations applied (init, flagged status, polls, grocery bills) |
| Security   | Connection string stored as environment variable, never hardcoded |

![Neon Database 1](./DSO101_GROUP7_PROJECT_REPORT.assets/page-11-img-0.png)

![Neon Database 2](./DSO101_GROUP7_PROJECT_REPORT.assets/page-11-img-1.png)

---

## Security Considerations

### Render Environment Variables (Backend)

All backend credentials are stored as environment variables in the Render dashboard. No secrets are stored in the GitHub repository or workflow files.

| Variable     | Purpose                                      |
| ------------ | -------------------------------------------- |
| DATABASE_URL | Neon PostgreSQL connection string            |
| JWT_SECRET   | JWT signing secret for authentication tokens |
| PORT         | Port the Express server listens on (5000)    |
| FRONTEND_URL | Allowed CORS origin (Render frontend URL)    |

![Neon PostgreSQL](./DSO101_GROUP7_PROJECT_REPORT.assets/page-12-img-0.png)

![Neon PostgreSQL 2](./DSO101_GROUP7_PROJECT_REPORT.assets/page-12-img-1.png)

### Render Environment Variables (Frontend)

| Variable            | Purpose                                     |
| ------------------- | ------------------------------------------- |
| NEXT_PUBLIC_API_URL | Backend API URL (Render backend deployment) |

![Render Frontend Variables](./DSO101_GROUP7_PROJECT_REPORT.assets/page-12-img-2.png)

### GitHub Secrets

| Secret                      | Purpose                                             |
| --------------------------- | --------------------------------------------------- |
| NEXT_PUBLIC_API_URL         | Backend URL injected during Next.js build in CI     |
| RENDER_BACKEND_DEPLOY_HOOK  | Render webhook URL to trigger backend redeployment  |
| RENDER_FRONTEND_DEPLOY_HOOK | Render webhook URL to trigger frontend redeployment |

![GitHub Secrets Configuration](./DSO101_GROUP7_PROJECT_REPORT.assets/page-13-img-0.png)

### Other Security Measures

- .env and .env.local are in .gitignore - never committed to the repository
- Passwords hashed using bcryptjs with salt rounds of 10
- JWT tokens expire after 7 days

![JWT Token Expiry](./DSO101_GROUP7_PROJECT_REPORT.assets/page-13-img-1.png)

- Input validation on all routes using express-validator
- Role-based access control (STUDENT and ADMIN roles)
- CORS configured to only allow requests from the frontend URL
- HTTPS enforced by default on Render for all services

### Frontend Interceptor

![Frontend Interceptor](./DSO101_GROUP7_PROJECT_REPORT.assets/page-14-img-0.png)

- Alpine base images reduce the attack surface of Docker containers

#### Backend Dockerfile

![Backend Docker Security](./DSO101_GROUP7_PROJECT_REPORT.assets/page-14-img-1.png)

#### Frontend Dockerfile

![Frontend Docker Security](./DSO101_GROUP7_PROJECT_REPORT.assets/page-14-img-2.png)

---

## Documentation & Presentation

- This report covering all implementation details
- README.md in the GitHub repository with setup instructions and environment variable list
- Inline comments in Dockerfiles and workflow file explaining key configurations
- Final project presentation covering architecture, pipeline flow, and deployment

---

## Challenges and Solutions

| Challenge                                               | Solution                                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| DATABASE_URL not found by Prisma on Render              | Discovered environment variable key was saved as 'Database_URL' instead of 'DATABASE_URL' (case-sensitive). Corrected in Render dashboard. |
| Git push timing out due to 455MB repository size        | Identified node_modules and .next build folder were not in .gitignore. Removed from git tracking and added to .gitignore.                  |
| Render free tier cold start causing slow first response | Added loading state on frontend to handle the delay gracefully.                                                                            |
| Neon database unreachable locally                       | Switched from pooler URL to direct connection URL for local development. Render uses pooler URL successfully.                              |
| GitHub Actions workflow file not triggering             | File was created with 0 bytes due to copy-paste issue. Re-created the file directly on GitHub with correct content.                        |
| CORS errors in production                               | Set FRONTEND_URL environment variable on Render backend to the exact frontend deployment URL.                                              |
| next.config.ts not supported                            | Updated Next.js from outdated global installation to latest version which supports TypeScript config files.                                |

---

## Conclusion

This project successfully implemented a CI/CD pipeline for the Hostel Mess Management System. The application is containerised using Docker with Alpine base images for both backend and frontend services. Every push to the main branch automatically triggers the GitHub Actions pipeline which builds, tests, and deploys both services to Render through deploy hooks.

The database is hosted on Neon (serverless PostgreSQL) and all migrations were applied using Prisma. All credentials are secured through GitHub Secrets and Render environment variables with no hardcoded values anywhere in the codebase. The application is accessible at https://hostel-mess-frontend.onrender.com.

---

## References

- Docker Inc. (2024). Dockerfile best practices. https://docs.docker.com/develop/develop-images/dockerfile_best-practices
- GitHub. (2024). Understanding GitHub Actions. https://docs.github.com/en/actions
- Render. (2024). Web Services. https://render.com/docs/web-services
- Neon. (2024). Neon documentation. https://neon.tech/docs
- Prisma. (2024). Prisma ORM documentation. https://www.prisma.io/docs
- Next.js. (2024). Deploying Next.js. https://nextjs.org/docs/deployment

---

**Last Updated:** May 2026  
**Status:** Production Ready
