# 006 — Field Operations

Adversarial governance demo for AI spending agents. A spending agent plans transactions; **006** intercepts, interrogates, and issues verdicts before anything hits the payment rail.

James Bond–inspired field-ops aesthetic: dark UI, gold accents, classified trace log.

## Stack

- Next.js 14 (App Router)
- Groq (LLM)
- Prisma + PostgreSQL
- Tailwind CSS

## Setup

```bash
cp .env.example .env   # if present; set DATABASE_URL and GROQ_API_KEY
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Development server |
| `npm run build`| Production build   |
| `npm run lint` | ESLint             |

## Mission scenarios

Use the sidebar to run preset demos: agent overreach (tips/fees) and prompt-injection wire transfers. 006 reconstructs intent, flags anomalies, and interrogates the agent.
