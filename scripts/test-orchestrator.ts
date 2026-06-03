import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { runTransaction } from "../src/lib/orchestrator";
import { SCENARIOS } from "../src/lib/scenarios";

async function runOne(key: keyof typeof SCENARIOS) {
  const scenario = SCENARIOS[key];
  console.log(`\n=========== ${key.toUpperCase()} ===========`);
  console.log("Prompt:", scenario.userPrompt);
  const session = await prisma.session.create({
    data: { userPrompt: scenario.userPrompt, scenarioKey: key },
  });
  await runTransaction(scenario.userPrompt, session.id, (step) => {
    if (step.type === "drift_verdict") {
      console.log("VERDICT:", step.verdict.verdict);
      console.log("REASONING:", step.verdict.reasoning);
    } else if (step.type === "drift_challenge") {
      console.log("INTENT:", step.challenge.intent_reconstruction);
      console.log("CANDIDATES:", step.challenge.drift_candidates);
      console.log("QUESTIONS:", step.challenge.questions);
    } else if (step.type === "transaction_submitted") {
      console.log("TX TOTAL: £", step.transaction.total, "merchant:", step.transaction.merchant);
      console.log("ITEMS:", step.transaction.items.map((i) => `${i.name} £${i.price} x${i.quantity}`).join("; "));
      console.log("FEES:", step.transaction.fees);
    } else if (step.type === "agent_message") {
      console.log("AGENT CHAT:", step.text.slice(0, 200));
    } else if (step.type === "agent_responses") {
      step.responses.answers.forEach((a) =>
        console.log(`ANSWER ${a.question_index}:`, a.response.slice(0, 200)),
      );
    } else if (step.type === "error") {
      console.log("ERROR @", step.stage, step.message);
    }
  });
}

async function main() {
  const arg = process.argv[2] || "clean";
  if (arg === "all") {
    for (const k of Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]) {
      await runOne(k);
    }
  } else {
    await runOne(arg as keyof typeof SCENARIOS);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
