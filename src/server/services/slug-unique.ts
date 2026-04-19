import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

type Model = "category" | "product";

export async function uniqueSlug(
  model: Model,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug || "item";
  let n = 0;

  while (true) {
    const existing =
      model === "category"
        ? await prisma.category.findUnique({
            where: { slug: candidate },
            select: { id: true },
          })
        : await prisma.product.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }
    n += 1;
    candidate = `${baseSlug}-${n}`;
  }
}

export async function slugFromName(
  model: Model,
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name);
  return uniqueSlug(model, base, excludeId);
}
