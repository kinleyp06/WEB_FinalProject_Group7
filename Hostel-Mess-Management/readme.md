# Real-Time Notification System using Firebase Cloud Messaging (FCM)

# Introduction

This project implements a real-time notification system using Firebase Cloud Messaging (FCM) integrated with a React frontend and Node.js backend.

The main purpose of this system is to automatically send scheduled notifications to users for mess reminders such as:

- Breakfast Reminder 🍳
- Lunch Reminder 🍛
- Evening Tea Reminder ☕
- Dinner Reminder 🍽️

The system uses Firebase to generate device tokens and deliver push notifications, while the backend manages scheduling and message delivery.

---

# Objectives

The objectives of this project are:

1. To integrate Firebase Cloud Messaging into a web application.
2. To request notification permissions from users.
3. To generate unique device tokens for notification delivery.
4. To store user tokens in the backend server.
5. To schedule automatic notifications using cron jobs.
6. To send real-time push notifications to connected users.

---

# Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| Firebase | Push notification service |
| Firebase Cloud Messaging (FCM) | Notification delivery |
| Node.js | Backend runtime |
| Express.js | Backend server |
| node-cron | Scheduled task automation |
| Firebase Admin SDK | Send notifications from backend |
| JavaScript | Application logic |

---

# Project Requirements

# Frontend Requirements

The frontend is responsible for:

- Initializing Firebase
- Requesting notification permission
- Generating FCM device tokens
- Sending tokens to backend server

Required packages:

```bash
npm install firebase