# Dobby Ads Assignment

A Google Drive-inspired file manager with nested folders and image uploads.

## Tech Stack
- **Backend**: Node.js + Express + MongoDB + JWT
- **Frontend**: React (Vite) + Tailwind CSS

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)

### Backend
```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Test Credentials
- Email: `test@dobby.com`
- Password: `test1234`

> Create this account via the Signup page first.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/folders | List folders (query: parentId) |
| POST | /api/folders | Create folder |
| DELETE | /api/folders/:id | Delete folder (recursive) |
| GET | /api/folders/breadcrumb/:folderId | Get breadcrumb trail |
| GET | /api/images | List images (query: folderId) |
| GET | /api/images/recent | Last 10 uploads |
| POST | /api/images | Upload image (multipart) |
| DELETE | /api/images/:id | Delete image |

## Features
- JWT authentication (signup/login/logout)
- Nested folder system with recursive size calculation
- Drag & drop image upload (multer)
- Breadcrumb navigation
- Recent uploads tab
- Per-user data isolation
- Responsive, Google Drive-inspired UI
