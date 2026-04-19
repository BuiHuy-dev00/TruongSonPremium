import { prisma } from "@/lib/db";
import { ok } from "@/lib/api-response";

export async function GET() {
  const items = await prisma.category.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
    },
  });
  return ok({ items });
}
