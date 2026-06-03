import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.session.create({
    data: {
      userPrompt: "smoketest: order a dozen eggs",
      scenarioKey: "clean",
    },
  });

  const tx = await prisma.transaction.create({
    data: {
      sessionId: session.id,
      merchant: "Tesco Express",
      items: [{ name: "Eggs (12)", price: 2.5, quantity: 1 }],
      subtotal: 2.5,
      fees: { tip: 0, priority: 0, service: 0 },
      total: 2.5,
      agentReasoning: "Cheapest dozen in catalogue.",
      verdict: "APPROVE",
      verdictReasoning: "Within budget, no drift.",
    },
  });

  const drift = await prisma.drift.create({
    data: {
      transactionId: tx.id,
      intentReconstruction: "User wanted a dozen eggs. Transaction matches.",
      driftCandidates: [],
      questions: [],
      agentResponses: [],
      scores: [],
      rawVerdict: { phase: "verdict", verdict: "APPROVE" },
    },
  });

  const readback = await prisma.session.findUnique({
    where: { id: session.id },
    include: { transactions: { include: { drift: true } } },
  });

  console.log(JSON.stringify(readback, null, 2));

  await prisma.drift.delete({ where: { id: drift.id } });
  await prisma.transaction.delete({ where: { id: tx.id } });
  await prisma.session.delete({ where: { id: session.id } });

  console.log("smoketest OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
