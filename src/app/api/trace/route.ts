import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      drift: true,
      session: true,
    },
  });

  return Response.json({ transactions });
}
