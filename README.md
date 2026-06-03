# CodeInsight 🔍

AI-powered code review and quality analysis platform. Submit code and receive structured reports on complexity, readability, duplication, and improvement suggestions — powered by Claude AI.

---

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18, Vite, React Router  |
| Backend   | Node.js, Express              |
| AI        | Anthropic Claude API          |
| Auth      | JWT + bcryptjs                |
| Database  | SQLite (via better-sqlite3)   |

---

## Project Structure

```
codeinsight/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # Auth context
│   │   └── utils/        # API helpers
│   └── ...
├── backend/           # Express API server
│   ├── routes/        # API route definitions
│   ├── controllers/   # Business logic
│   ├── middleware/    # Auth, error handling
│   ├── models/        # DB models
│   └── config/        # DB + env setup
└── README.md
```

---

## Getting Started

### 1. Clone / open in VS Code

```bash
cd codeinsight
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your Anthropic API key
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open in browser

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000

---

## Demo Accounts

| Email                   | Password  | Role          |
|-------------------------|-----------|---------------|
| dev@codeinsight.io      | demo1234  | Senior Dev    |
| student@uni.edu         | learn123  | CS Student    |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your Anthropic API key at: https://console.anthropic.com

---

## GitHub Upload

```bash
git init
git add .
git commit -m "Initial commit: CodeInsight full-stack app"
git remote add origin https://github.com/YOUR_USERNAME/codeinsight.git
git push -u origin main
```

---

## Features

- 🔐 JWT authentication (register / login)
- ⚡ AI code analysis via Claude (complexity, readability, duplication, suggestions)
- 📋 Submission history per user
- 📊 Performance dashboard with score trends
- 🌐 RESTful API backend
- 💾 SQLite database (zero setup)
