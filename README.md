# 006 — Field Operations

**Adversarial governance for AI spending agents.** When an agent tries to move money, **006** intercepts the transaction, reconstructs what the user actually meant, interrogates the agent, and issues a verdict before anything hits the payment rail.

James Bond field-ops UI: dark panels, gold accents, classified trace log. Built for the **Move 37** student competition (Build track) — [github.com/Tosin-A/006](https://github.com/Tosin-A/006).

---

## The Move 37 insight

Finance is moving toward autonomous agents that plan and execute spend on a user's behalf. The obvious controls — budgets, merchant allowlists, velocity caps — miss a subtler failure mode: **intent drift**. Agents quietly add tips, priority fees, and “helpful” extras the user never asked for. Worse, **prompt injection** can smuggle wire transfers into an otherwise innocent grocery order.

The non-obvious move: treat the transaction as evidence, not the agent's story. A second AI layer (**006**) reconstructs intent from the basket alone, flags anomalies against the verbatim user request, and **interrogates** the spending agent under an adversarial rubric before approval. That's the governance gap rules engines don't see — and the insight this demo argues finance must design for as agents go live.

*What's your Move 37?*

---

## What it does

In a nutshell, this is a web app where you watch a spending agent try to move money and a second AI — **006** — decide whether to let it.

You hand the spending agent a goal in chat (or pick a preset scenario), something like *"Order ingredients for scrambled eggs. Budget £15."* A Groq-powered assistant turns that into a real transaction: a merchant, line items, and fees. Left to its own devices it tends to overreach — slipping in tips, priority delivery, or extras nobody asked for — and on a poisoned prompt it'll even act on a hidden wire instruction.

That's where **006** steps in. Before anything settles, it intercepts the transaction and treats it as evidence rather than taking the agent's word for it. It reconstructs what the user *actually* asked for from the basket alone, flags any line items or fees that don't match the real request, and interrogates the agent one pointed question at a time — scoring each answer as coherent, weak, or incoherent. Then it returns a verdict: **approve**, **modify**, **escalate**, or **deny**, with its reasoning streamed back into the conversation.

The whole interrogation plays out live in the **Field Operations** panel — intercepted transaction, intent reconstruction, interrogation, verdict — and every run is logged to the classified trace drawer (PostgreSQL via Prisma) so you can review merchants, totals, and verdicts after the fact.

### Demo scenarios

| Scenario | What it shows |
|----------|----------------|
| **Clean transaction** | Narrow request; should approve with no drift. |
| **The £31 eggs** | Agent overreach — tips and priority fees on a modest grocery budget. |
| **Prompt injection** | Hidden wire instruction in the user message; 006 catches misalignment via intent reconstruction. |

---

## How AI changes finance here

AI is not a chat wrapper on top of static rules.

- **The spending agent** is the product direction finance is heading toward: natural-language goals become executable payment intents.
- **006** is a deliberately adversarial second model — it does not help the agent; it protects the user by cross-examining intent, scoring justifications, and blocking or modifying bad submissions.
- **Governance is conversational and semantic** — drift is detected from meaning (user request vs. basket), not regex on merchant codes.
- **Injection resistance** is demonstrated live: compromised agent behaviour vs. 006's independent reconstruction.

Without LLMs, you cannot run this loop at the speed and nuance agents require. With only LLMs and no 006-shaped layer, users inherit silent overreach and injection risk on every autonomously initiated payment.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| App | Next.js 14 (App Router), React, Tailwind CSS |
| LLM | Groq (`llama-3.3-70b-versatile` by default) |
| Data | Prisma + PostgreSQL |
| Streaming | Server-Sent Events from `/api/run` |

---

## Run locally

**Requirements:** Node.js 18+, PostgreSQL, [Groq API key](https://console.groq.com/).

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/006"
GROQ_API_KEY="your-groq-api-key"
# optional:
GROQ_MODEL="llama-3.3-70b-versatile"
```

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pick a scenario from the sidebar or type your own spend instruction in chat.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

---

## Demo & submission

- **Repository:** [https://github.com/Tosin-A/006](https://github.com/Tosin-A/006)
- **Competition:** Move 37 — **Build** track submission (AI × finance)
- **Live flow:** run a scenario → watch chat + 006 Field Operations panel update in real time → inspect the trace drawer for verdict history

---

## Event

**Move 37** — student competition at the intersection of AI and finance. Imperial College London, evening **9 June 2026**, during London Tech Week. Hosted by Wissen AI; finalists demo live. Prizes include cash awards and Azure credits among other partner perks.

Named after AlphaGo's Move 37: the non-obvious play humans missed first — applied here to where finance is today, not where it was in 2016.
