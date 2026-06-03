import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { runTransaction } from "@/lib/orchestrator";
import type { RunStep } from "@/lib/types";
import { SCENARIOS, type ScenarioKey } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userPrompt: string | undefined = body.userPrompt;
  const scenarioKey: ScenarioKey | undefined = body.scenarioKey;

  if (!userPrompt || typeof userPrompt !== "string") {
    return new Response(JSON.stringify({ error: "userPrompt required" }), { status: 400 });
  }

  const session = await prisma.session.create({
    data: {
      userPrompt,
      scenarioKey: scenarioKey && SCENARIOS[scenarioKey] ? scenarioKey : null,
    },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (step: RunStep) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
      };

      controller.enqueue(encoder.encode(`: ready\n\n`));

      try {
        await runTransaction(userPrompt, session.id, send);
      } catch (e) {
        send({ type: "error", stage: "orchestrator", message: (e as Error).message });
        send({ type: "done", sessionId: session.id });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
