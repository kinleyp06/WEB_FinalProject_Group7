# Hostel Mess Management System - Phase 1 Setup Guide

## Project Overview
A comprehensive Hostel Mess Management System for WEB101 & WEB102 course project.

**Tech Stack:**
- Frontend: Next.js 14 with TypeScript & Tailwind CSS
- Backend: NestJS with TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT (JSON Web Tokens)

**Team Members:**
- Kinley Pem - Project Lead & Backend Core
- Sonam Wangmo - Frontend Lead & Student Module
- Tshering Tenzin - Admin Module & Charts
- Pelden Nidup - API & Database Integration
- Yeshi Lhendrup - Real-time & Testing

---

## 📋 Prerequisites

Before starting, make sure you have installed:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify: `git --version`

3. **PostgreSQL** (database)
   - Download from: https://postgresql.org/download
   - OR use Docker (optional)

4. **Code Editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com/

---

## 🚀 Phase 1: Project Setup & Core Configuration
### Timeline: March 28 – April 13

---

## Section 1: Project Setup (March 28-30)
**Assigned to: Kinley Pem**

### Step 1.1: Create the Monorepo Structure

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux).

```bash
# Navigate to your projects folder
cd Desktop

# Create project folder
mkdir hostel-mess-system

# Enter the folder
cd hostel-mess-system

# Create separate folders for frontend and backend
mkdir frontend
mkdir backend
```

### Step 1.2: Initialize Git Repository

```bash
# Inside hostel-mess-system folder
git init

# Create .gitignore file
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo ".next/" >> .gitignore
echo "dist/" >> .gitignore
```

### Step 1.3: Set up the Backend (NestJS)

```bash
# Go into backend folder
cd backend

# Initialize npm project
npm init -y

# Install NestJS core packages
npm install @nestjs/core @nestjs/common @nestjs/platform-express reflect-metadata rxjs

# Install development dependencies
npm install -D @nestjs/cli typescript @types/node ts-node nodemon

# Create TypeScript configuration
npx tsc --init

# Create source folder structure
mkdir src
cd src
```

Create these files in the `backend/src/` folder:

**File: `backend/src/main.ts`**
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allow frontend to connect
  await app.listen(4000);
  console.log('Backend running on http://localhost:4000');
}
bootstrap();
```

**File: `backend/src/app.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

**File: `backend/src/app.controller.ts`**
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hostel Mess API is working!';
  }
}
```

**Update `backend/package.json`** - Add these scripts:
```json
"scripts": {
  "start": "npx nodemon --exec ts-node src/main.ts",
  "start:prod": "node dist/main.js"
}
```

### Step 1.4: Set up the Frontend (Next.js)

Open a **new terminal** window:

```bash
cd Desktop/hostel-mess-system/frontend

# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir
```

When prompted:
- Would you like to use `src/` directory? → **No**
- Would you like to use App Router? → **Yes**
- Would you like to customize import alias? → **No**

### Step 1.5: Test Both Servers

**Terminal 1 (Backend):**
```bash
cd Desktop/hostel-mess-system/backend
npm run start
```
Expected output: `Backend running on http://localhost:4000`

**Terminal 2 (Frontend):**
```bash
cd Desktop/hostel-mess-system/frontend
npm run dev
```
Expected output: `ready - started server on http://localhost:3000`

**Test in Browser:**
- Frontend: http://localhost:3000 (Next.js welcome page)
- Backend: http://localhost:4000 ("Hostel Mess API is working!")

---

# Section 2: Requirement Analysis (March 30 - April 2)
**Assigned to: Full Team**

Create `REQUIREMENTS.md` in the project root:


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

## Section 3: UI Design (April 2-6)
**Assigned to: Sonam Wangmo**

### Step 3.1: Create Basic Layout Structure

```bash
cd Desktop/hostel-mess-system/frontend/app

# Create folder structure
mkdir -p auth/login
mkdir -p auth/register
mkdir -p dashboard/student
mkdir -p dashboard/admin
mkdir -p components
```

**File: `frontend/app/layout.tsx`**
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hostel Mess Management",
  description: "Manage hostel meals, feedback, and polls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
```

**File: `frontend/app/page.tsx`**
```tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hostel Mess Management System</h1>
        <p className="text-gray-600 mb-8">Manage meals, submit feedback, and vote on special meals</p>
        <div className="space-x-4">
          <Link href="/auth/login" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Login
          </Link>
          <Link href="/auth/register" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**File: `frontend/app/auth/login/page.tsx`**
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // TODO: Connect to backend API
    console.log("Login attempt:", { email, password });
    
    // Temporary redirect
    router.push("/dashboard/student");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**File: `frontend/app/auth/register/page.tsx`**
```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    console.log("Register attempt:", { name, email, password });
    
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            Register
          </button>
        </form>
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-green-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**File: `frontend/app/dashboard/student/page.tsx`**
```tsx
export default function StudentDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <p>Welcome to the Hostel Mess Management System!</p>
      <p className="text-gray-600 mt-2">Today's Meal Plan will appear here.</p>
    </div>
  );
}
```

**File: `frontend/app/dashboard/admin/page.tsx`**
```tsx
export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Manage meals, moderate feedback, and upload bills.</p>
    </div>
  );
}
```

### Step 3.2: Test Frontend

```bash
cd Desktop/hostel-mess-system/frontend
npm run dev
```

Open http://localhost:3000 and verify:
- Login link works
- Register link works
- Forms navigate correctly

---

## Section 4: Database Schema v2 (April 6-9)
**Assigned to: Pelden Nidup**

### Step 4.1: Install Prisma

```bash
cd Desktop/hostel-mess-system/backend

# Install Prisma
npm install prisma --save-dev
npm install @prisma/client

# Initialize Prisma
npx prisma init
```

### Step 4.2: Configure Database Connection

**Update `backend/.env`:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hostel_mess_db?schema=public"
```

### Step 4.3: Set Up PostgreSQL

**Option A: Local PostgreSQL Installation**

1. Download from https://postgresql.org/download
2. Install with default settings (remember password)
3. Open pgAdmin or Command Line and run:
```sql
CREATE DATABASE hostel_mess_db;
```

**Option B: Docker (Alternative)**

Create `backend/docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: hostel-mess-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: hostel_mess_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
cd Desktop/hostel-mess-system/backend
docker-compose up -d
```

### Step 4.4: Create Database Schema

**Replace `backend/prisma/schema.prisma`:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model with role-based access
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  feedback   Feedback[]
  votes      PollVote[]
  suggestions Suggestion[]
}

enum Role {
  STUDENT
  ADMIN
}

// Meal Plan
model MealPlan {
  id          String   @id @default(cuid())
  dayOfWeek   String
  mealType    MealType
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
}

// Student Feedback
model Feedback {
  id        String       @id @default(cuid())
  rating    Int
  comment   String?
  status    FeedbackStatus @default(PENDING)
  userId    String
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  user      User         @relation(fields: [userId], references: [id])
}

enum FeedbackStatus {
  PENDING
  APPROVED
  REJECTED
}

// Student Suggestions
model Suggestion {
  id          String   @id @default(cuid())
  title       String
  description String
  isFlagged   Boolean  @default(false)
  status      SuggestionStatus @default(PENDING)
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
}

enum SuggestionStatus {
  PENDING
  APPROVED
  REJECTED
}

// Grocery Bills
model GroceryBill {
  id          String   @id @default(cuid())
  fileName    String
  fileUrl     String
  totalAmount Float
  billDate    DateTime
  description String?
  uploadedBy  String
  createdAt   DateTime @default(now())
}

// Special Meal Polls
model SpecialMealPoll {
  id          String   @id @default(cuid())
  title       String
  description String?
  options     String[]
  isActive    Boolean  @default(true)
  validUntil  DateTime
  createdAt   DateTime @default(now())
  
  votes       PollVote[]
}

// Individual Votes
model PollVote {
  id        String   @id @default(cuid())
  pollId    String
  userId    String
  choice    String
  createdAt DateTime @default(now())

  poll      SpecialMealPoll @relation(fields: [pollId], references: [id])
  user      User            @relation(fields: [userId], references: [id])

  @@unique([pollId, userId])
}
```

### Step 4.5: Apply Database Migration

```bash
cd Desktop/hostel-mess-system/backend

# Create and apply migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio to view database
npx prisma studio
```

Prisma Studio opens at http://localhost:5555

---

## Section 5: Authentication (April 9-13)
**Assigned to: Kinley Pem**

### Step 5.1: Install Auth Packages

```bash
cd Desktop/hostel-mess-system/backend

npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @types/bcrypt @types/passport-jwt --save-dev
```

### Step 5.2: Create Auth Module

```bash
cd Desktop/hostel-mess-system/backend/src
mkdir auth
cd auth
```

**File: `backend/src/auth/auth.service.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'STUDENT',
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  async validateUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
```

**File: `backend/src/auth/jwt.strategy.ts`**
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-secret-key-change-this-in-production',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
```

**File: `backend/src/auth/auth.controller.ts`**
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string }) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
```

**File: `backend/src/auth/auth.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'your-secret-key-change-this-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### Step 5.3: Update App Module

**Update `backend/src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
```

### Step 5.4: Create Auth Guard

```bash
cd Desktop/hostel-mess-system/backend/src
mkdir guards
```

**File: `backend/src/guards/auth.guard.ts`**
```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

### Step 5.5: Test Authentication API

Start backend:
```bash
cd Desktop/hostel-mess-system/backend
npm run start
```

**Test with Postman or curl:**

Register:
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123","name":"Test Student"}'
```

Login:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "cks_xxx",
    "email": "student@example.com",
    "name": "Test Student",
    "role": "STUDENT"
  }
}
```

### Step 5.6: Connect Frontend to Backend

```bash
cd Desktop/hostel-mess-system/frontend
npm install axios
```

**Create `frontend/lib/api.ts`:**
```typescript
import axios from 'axios';

const API_URL = 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (email: string, password: string, name: string) => {
  const response = await api.post('/auth/register', { email, password, name });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
```

### Step 5.7: Update Frontend Login Page

**Update `frontend/app/auth/login/page.tsx`** - Replace handleSubmit:

```tsx
import { login } from '@/lib/api';

// Replace the handleSubmit function with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  
  try {
    const result = await login(email, password);
    if (result.user.role === 'ADMIN') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/student');
    }
  } catch (err: any) {
    setError(err.response?.data?.message || 'Login failed');
  }
};
```

**Update `frontend/app/auth/register/page.tsx`** - Replace handleSubmit:

```tsx
import { register } from '@/lib/api';

// Replace the handleSubmit function with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  
  try {
    await register(email, password, name);
    router.push('/dashboard/student');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Registration failed');
  }
};
```

---

## ✅ Phase 1 Completion Checklist

Verify each item:

- [ ] Backend running on `http://localhost:4000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] PostgreSQL database running
- [ ] Prisma schema applied (`npx prisma migrate dev`)
- [ ] User can register (check database in Prisma Studio)
- [ ] User can login (receives JWT token)
- [ ] JWT token saved in localStorage
- [ ] Login redirects to correct dashboard
- [ ] Logout clears token

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `Error: Cannot find module` | Run `npm install` in both frontend and backend folders |
| `Prisma: Can't reach database` | Ensure PostgreSQL is running (`docker-compose up -d` or check pgAdmin) |
| `CORS error` | CORS is enabled in `main.ts` with `app.enableCors()` |
| `Port 4000 already in use` | Kill process using port 4000 or change port in `main.ts` |
| `JWT secret error` | Ensure secret matches in `jwt.strategy.ts` and `auth.module.ts` |
| `bcrypt installation error` | On Windows, run `npm install --global windows-build-tools` first |
| `TypeScript errors` | Make sure all types are installed: `npm install -D @types/node` |

---

## 📁 Project Structure After Phase 1

```
hostel-mess-system/
├── frontend/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   │   └── page.tsx
│   │   │   └── student/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── package.json
│   └── next.config.js
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   └── package.json
├── REQUIREMENTS.md
├── API_DESIGN.md
└── README.md
```

---

## 🚀 Next Steps

After completing Phase 1, you will move to **Phase 2: Frontend Foundation** (April 13-19), which includes:

1. Building reusable components (MealCard, PollWidget, NotificationToast)
2. Creating student and admin layouts with navigation
3. Setting up TanStack Query for data fetching
4. Implementing protected routes
5. Building the meal plan display

**Estimated time to complete Phase 1:** 3-5 days for beginners

**Team coordination:**
- Kinley Pem: Backend setup and authentication
- Sonam Wangmo: Frontend pages and routing
- Pelden Nidup: Database and Prisma
- Team: Test together after each section

---

## 📞 Need Help?

- Check console logs in browser (F12 → Console)
- Check terminal output for backend errors
- Verify database connection with `npx prisma studio`
- Ensure both servers are running simultaneously