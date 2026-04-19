import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import {
  listHotProducts,
  listProductsByCategorySlug,
} from "@/server/services/product.service";
import { toPublicProduct } from "@/server/mappers/product-public";
import { getSellerContact } from "@/server/services/seller-contact.service";

const HOT_LIMIT = 8;
const PER_CATEGORY = 4;

export async function getHomePagePayload() {
  noStore();
  const categories = await prisma.category.findMany({
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

  const hotProductsRaw = await listHotProducts(HOT_LIMIT);

  const sellerContact = await getSellerContact();

  const productsByCategory = await Promise.all(
    categories.map(async (c) => {
      const products = await listProductsByCategorySlug(c.slug, PER_CATEGORY);
      return {
        category: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
        },
        products: products.map(toPublicProduct),
      };
    })
  );

  return {
    categories,
    hotProducts: hotProductsRaw.map(toPublicProduct),
    productsByCategory,
    sellerContact: {
      telegramUrl: sellerContact.telegramUrl,
      telegramHandle: sellerContact.telegramHandle,
      zaloDisplay: sellerContact.zaloDisplay,
      zaloUrl: sellerContact.zaloUrl,
      facebookUrl: sellerContact.facebookUrl,
      facebookLabel: sellerContact.facebookLabel,
      phone: sellerContact.phone,
      note: sellerContact.note,
    },
  };
}

export type HomePayload = Awaited<ReturnType<typeof getHomePagePayload>>;
