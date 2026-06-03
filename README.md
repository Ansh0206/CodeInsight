# CodeInsight

CodeInsight is a full-stack code review dashboard. Paste code, choose a language, and receive a structured quality report with scores, issues, strengths, and actionable suggestions.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| AI | Anthropic Claude API with local fallback analyzer |
| Database | SQLite via better-sqlite3 |

## Features

- No-login demo flow for quick evaluation
- Code review scoring for complexity, readability, duplication, and maintainability
- Security and maintainability issue detection
- Actionable suggestions and strengths
- Saved review history
- Dashboard with score trends and language breakdown
- Works without an Anthropic key by using the built-in local analyzer

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5000
```

Optional AI setup:

```text
ANTHROPIC_API_KEY=your_key_here
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

If the API key is missing or the API call fails, CodeInsight automatically uses the local analyzer.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Project Structure

```text
codeinsight/
  backend/
    config/
    controllers/
    routes/
    server.js
  frontend/
    src/
      components/
      pages/
      utils/
```

## Build Check

```bash
cd frontend
npm run build
```
