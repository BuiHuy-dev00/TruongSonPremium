import type { Prisma, SellerContact } from "@prisma/client";
import { prisma } from "@/lib/db";

const SINGLETON_ID = "singleton";

export async function getSellerContact(): Promise<SellerContact> {
  const existing = await prisma.sellerContact.findUnique({
    where: { id: SINGLETON_ID },
  });
  if (existing) {
    return existing;
  }
  return prisma.sellerContact.create({
    data: { id: SINGLETON_ID },
  });
}

export async function updateSellerContact(
  data: Partial<
    Pick<
      SellerContact,
      | "telegramUrl"
      | "telegramHandle"
      | "zaloDisplay"
      | "zaloUrl"
      | "facebookUrl"
      | "facebookLabel"
      | "phone"
      | "note"
    >
  >
): Promise<SellerContact> {
  await getSellerContact();

  const payload = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Prisma.SellerContactUpdateInput;

  return prisma.sellerContact.update({
    where: { id: SINGLETON_ID },
    data: payload,
  });
}
