import { groq, GROQ_MODEL } from "./groq";
import { prisma } from "./prisma";
import { SPENDING_AGENT_PROMPT, SIX_PROMPT } from "./prompts";
import type {
  AgentSubmission,
  AgentTransaction,
  DriftChallenge,
  AgentDriftResponses,
  DriftVerdict,
  RunStep,
} from "./types";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function stripCodeFences(s: string): string {
  const trimmed = s.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

function extractJson<T>(raw: string): T | null {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1)) as T;
    } catch {}
  }
  return null;
}

async function callModel(messages: ChatMessage[], temperature: number): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature,
  });
  return completion.choices[0]?.message?.content ?? "";
}

async function callJson<T>(
  messages: ChatMessage[],
  temperature: number,
  retryInstruction: string,
): Promise<{ parsed: T | null; raw: string }> {
  const raw = await callModel(messages, temperature);
  let parsed = extractJson<T>(raw);
  if (parsed) return { parsed, raw };

  const retry = await callModel(
    [...messages, { role: "assistant", content: raw }, { role: "user", content: retryInstruction }],
    temperature,
  );
  parsed = extractJson<T>(retry);
  return { parsed, raw: retry };
}

function classifyAgentOutput(text: string): AgentSubmission {
  const cleaned = stripCodeFences(text);
  const parsed = extractJson<{
    action?: string;
    merchant?: string;
    items?: { name: string; price: number; quantity: number }[];
    fees?: { tip?: number; priority?: number; service?: number };
    reasoning?: string;
  }>(cleaned);

  if (parsed && parsed.action === "submit_transaction" && parsed.merchant && parsed.items) {
    const items = parsed.items;
    const fees = {
      tip: Number(parsed.fees?.tip ?? 0),
      priority: Number(parsed.fees?.priority ?? 0),
      service: Number(parsed.fees?.service ?? 0),
    };
    const subtotal = items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
    const total = subtotal + fees.tip + fees.priority + fees.service;
    return {
      kind: "transaction",
      merchant: parsed.merchant,
      items,
      fees,
      reasoning: parsed.reasoning ?? "",
      subtotal: Number(subtotal.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }

  return { kind: "chat", text: cleaned };
}

export async function runTransaction(
  userPrompt: string,
  sessionId: string,
  emit: (step: RunStep) => void,
): Promise<void> {
  const agentHistory: ChatMessage[] = [
    { role: "system", content: SPENDING_AGENT_PROMPT },
    { role: "user", content: userPrompt },
  ];

  let firstRaw: string;
  try {
    firstRaw = await callModel(agentHistory, 0.7);
  } catch (e) {
    emit({ type: "error", stage: "agent_initial", message: (e as Error).message });
    emit({ type: "done", sessionId });
    return;
  }
  agentHistory.push({ role: "assistant", content: firstRaw });

  const submission = classifyAgentOutput(firstRaw);

  if (submission.kind === "chat") {
    emit({ type: "agent_message", text: submission.text });
    emit({ type: "done", sessionId });
    return;
  }

  const tx = await prisma.transaction.create({
    data: {
      sessionId,
      merchant: submission.merchant,
      items: submission.items,
      subtotal: submission.subtotal,
      fees: submission.fees,
      total: submission.total,
      agentReasoning: submission.reasoning,
      verdict: "PENDING",
      verdictReasoning: "",
    },
  });

  emit({ type: "transaction_submitted", transaction: submission, transactionId: tx.id });

  const challengeMessages: ChatMessage[] = [
    { role: "system", content: SIX_PROMPT },
    {
      role: "user",
      content: `Original user request (verbatim):\n${userPrompt}\n\nTransaction the agent is attempting:\n${JSON.stringify(
        {
          merchant: submission.merchant,
          items: submission.items,
          fees: submission.fees,
          subtotal: submission.subtotal,
          total: submission.total,
          agent_reasoning: submission.reasoning,
        },
        null,
        2,
      )}\n\nProduce only the challenge JSON block.`,
    },
  ];

  const challengeResult = await callJson<{
    phase?: string;
    intent_reconstruction?: string;
    drift_candidates?: string[];
    questions?: string[];
  }>(
    challengeMessages,
    0.3,
    "Your previous output was not valid JSON. Reply with the challenge JSON block exactly as specified, and nothing else.",
  );

  if (!challengeResult.parsed || !challengeResult.parsed.questions) {
    emit({
      type: "error",
      stage: "drift_challenge",
      message: "006 did not return a valid challenge.",
    });
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { verdict: "ERROR", verdictReasoning: "006 challenge parse failed" },
    });
    emit({ type: "done", sessionId, transactionId: tx.id });
    return;
  }

  const challenge: DriftChallenge = {
    intent_reconstruction: challengeResult.parsed.intent_reconstruction ?? "",
    drift_candidates: challengeResult.parsed.drift_candidates ?? [],
    questions: challengeResult.parsed.questions ?? [],
  };

  emit({ type: "drift_challenge", challenge });

  agentHistory.push({
    role: "user",
    content: `006 is challenging your transaction. Answer each question honestly. Reply with the respond_to_drift JSON block exactly as specified.\n\nIntent reconstruction by 006: ${
      challenge.intent_reconstruction
    }\n\nAnomaly candidates: ${JSON.stringify(challenge.drift_candidates)}\n\nQuestions:\n${challenge.questions
      .map((q, i) => `${i}. ${q}`)
      .join("\n")}`,
  });

  const responsesResult = await callJson<{
    action?: string;
    answers?: { question_index: number; response: string }[];
  }>(
    agentHistory,
    0.7,
    "Your previous reply was not valid JSON. Reply with the respond_to_drift JSON block exactly as specified, and nothing else.",
  );

  const agentResponses: AgentDriftResponses = {
    answers:
      responsesResult.parsed?.answers ??
      challenge.questions.map((_, i) => ({
        question_index: i,
        response: "(agent failed to respond in expected format)",
      })),
  };

  emit({ type: "agent_responses", responses: agentResponses });

  const verdictMessages: ChatMessage[] = [
    { role: "system", content: SIX_PROMPT },
    {
      role: "user",
      content: `Original user request (verbatim):\n${userPrompt}\n\nTransaction the agent attempted:\n${JSON.stringify(
        {
          merchant: submission.merchant,
          items: submission.items,
          fees: submission.fees,
          subtotal: submission.subtotal,
          total: submission.total,
          agent_reasoning: submission.reasoning,
        },
        null,
        2,
      )}\n\nYour earlier challenge:\n${JSON.stringify(challenge, null, 2)}\n\nAgent's responses to your questions:\n${JSON.stringify(
        agentResponses,
        null,
        2,
      )}\n\nProduce only the verdict JSON block.`,
    },
  ];

  const verdictResult = await callJson<{
    phase?: string;
    scores?: { question_index: number; score: "coherent" | "weak" | "incoherent"; note: string }[];
    verdict?: "APPROVE" | "MODIFY" | "ESCALATE" | "DENY";
    items_to_remove?: string[];
    reasoning?: string;
  }>(
    verdictMessages,
    0.3,
    "Your previous output was not valid JSON. Reply with the verdict JSON block exactly as specified, and nothing else.",
  );

  if (!verdictResult.parsed || !verdictResult.parsed.verdict) {
    emit({ type: "error", stage: "drift_verdict", message: "006 did not return a valid verdict." });
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { verdict: "ERROR", verdictReasoning: "006 verdict parse failed" },
    });
    emit({ type: "done", sessionId, transactionId: tx.id });
    return;
  }

  const verdict: DriftVerdict = {
    scores: verdictResult.parsed.scores ?? [],
    verdict: verdictResult.parsed.verdict,
    items_to_remove: verdictResult.parsed.items_to_remove ?? [],
    reasoning: verdictResult.parsed.reasoning ?? "",
  };

  emit({ type: "drift_verdict", verdict });

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: tx.id },
      data: { verdict: verdict.verdict, verdictReasoning: verdict.reasoning },
    }),
    prisma.drift.create({
      data: {
        transactionId: tx.id,
        intentReconstruction: challenge.intent_reconstruction,
        driftCandidates: challenge.drift_candidates,
        questions: challenge.questions,
        agentResponses: agentResponses.answers,
        scores: verdict.scores,
        rawVerdict: verdict as unknown as object,
      },
    }),
  ]);

  emit({ type: "done", sessionId, transactionId: tx.id });
}
