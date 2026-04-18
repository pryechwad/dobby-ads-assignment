# Dobby Ads

A Google Drive-inspired ad asset manager with nested folders, image uploads, and per-user data isolation.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Features](#features)
- [Test Credentials](#test-credentials)

---

## Overview

Dobby Ads is a file management web application built for creative teams to organize and manage ad assets. It supports nested folder hierarchies, drag-and-drop image uploads, breadcrumb navigation, and JWT-based authentication with full per-user data isolation.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Node.js, Express 5, MongoDB, Mongoose   |
| Auth      | JWT (jsonwebtoken), bcryptjs            |
| Uploads   | Multer                                  |
| Frontend  | React 19, Vite, Tailwind CSS            |
| Routing   | React Router DOM v7                     |
| HTTP      | Axios                                   |
| Icons     | Lucide React                            |

---

## Project Structure

```
dobby-ads-assignment/
├── backend/
│   ├── config/         # Database connection
│   ├── controllers/    # Route handlers (auth, folders, images)
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose models (User, Folder, Image)
│   ├── routes/         # Express routers
│   ├── uploads/        # Uploaded image files (gitignored)
│   ├── .env            # Environment variables
│   └── server.js       # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Reusable UI components
        ├── context/    # Auth context
        ├── pages/      # Route-level page components
        ├── services/   # Axios API service layer
        └── main.jsx    # Entry point
```

---

## Prerequisites

- Node.js 18 or higher
- MongoDB running locally on the default port

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

The API server starts on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## Environment Variables

Located at `backend/.env`:

| Variable    | Default                              | Description                  |
|-------------|--------------------------------------|------------------------------|
| PORT        | 5000                                 | Express server port          |
| MONGO_URI   | mongodb://localhost:27017/dobby-ads  | MongoDB connection string    |
| JWT_SECRET  | (set in .env)                        | Secret key for signing JWTs  |

---

## API Reference

### Auth

| Method | Endpoint         | Auth | Description          |
|--------|------------------|------|----------------------|
| POST   | /api/auth/signup | No   | Register a new user  |
| POST   | /api/auth/login  | No   | Login and get token  |
| GET    | /api/auth/me     | Yes  | Get current user     |

### Folders

| Method | Endpoint                          | Auth | Description                        |
|--------|-----------------------------------|------|------------------------------------|
| GET    | /api/folders                      | Yes  | List folders (query: `parentId`)   |
| POST   | /api/folders                      | Yes  | Create a new folder                |
| DELETE | /api/folders/:id                  | Yes  | Delete folder recursively          |
| GET    | /api/folders/breadcrumb/:folderId | Yes  | Get breadcrumb trail for a folder  |

### Images

| Method | Endpoint           | Auth | Description                        |
|--------|--------------------|------|------------------------------------|
| GET    | /api/images        | Yes  | List images (query: `folderId`)    |
| GET    | /api/images/recent | Yes  | Get last 10 uploaded images        |
| POST   | /api/images        | Yes  | Upload image (multipart/form-data) |
| DELETE | /api/images/:id    | Yes  | Delete an image                    |

---

## Features

- JWT authentication with signup, login, and logout
- Nested folder system with recursive folder size calculation
- Drag-and-drop image upload via Multer
- Breadcrumb navigation for deep folder traversal
- Recent uploads view (last 10 images)
- Per-user data isolation (users only see their own files)
- Grid and list view toggle
- Responsive UI inspired by Google Drive

---

## Test Credentials

Create an account on the Signup page using any credentials, or use the following after signing up:

```
Email:    test@dobby.com
Password: test1234
```

> Note: The account must be created via the Signup page before it can be used to log in.
