import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = String(
    process.env.ADMIN_EMAIL ?? "admin@truongsonpremium.com"
  ).toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const adminName =
    process.env.ADMIN_NAME?.trim() || "Admin TRUONGSON PREMIUM";

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      name: adminName,
    },
    create: {
      email,
      passwordHash,
      name: adminName,
    },
  });

  await prisma.sellerContact.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      telegramUrl: "https://t.me/liquid_tech_support",
      telegramHandle: "@liquid_tech_support",
      zaloDisplay: "09xx.xxx.xxx (Liquid Admin)",
      zaloUrl: "https://zalo.me",
      facebookUrl: "https://m.me/liquidtech",
      facebookLabel: "Liquid Tech Agency",
      phone: "0903123456",
      note: "Hỗ trợ 24/7 • Phản hồi trong 5 phút",
    },
  });

  const categories = [
    {
      name: "Facebook",
      slug: "facebook",
      description: "Tăng tương tác Facebook, Fanpage",
      sortOrder: 0,
    },
    {
      name: "TikTok",
      slug: "tiktok",
      description: "View, follow, tim TikTok",
      sortOrder: 1,
    },
    {
      name: "YouTube",
      slug: "youtube",
      description: "Subscribe, watch hours",
      sortOrder: 2,
    },
    {
      name: "Instagram",
      slug: "instagram",
      description: "Follow, like Instagram",
      sortOrder: 3,
    },
    {
      name: "Zalo",
      slug: "zalo",
      description: "Zalo OA, Zalo Ads",
      sortOrder: 4,
    },
    {
      name: "Tài khoản số",
      slug: "tai-khoan-so",
      description: "Netflix, ChatGPT, streaming...",
      sortOrder: 5,
    },
    {
      name: "Phần mềm tiện ích",
      slug: "phan-mem-tien-ich",
      description: "Canva, Spotify, tool creative",
      sortOrder: 6,
    },
  ];

  const categoryRecords: Record<string, string> = {};

  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
        isVisible: true,
      },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        sortOrder: c.sortOrder,
        isVisible: true,
      },
    });
    categoryRecords[c.slug] = row.id;
  }

  type SeedProduct = {
    name: string;
    slug: string;
    sku?: string;
    shortDescription: string;
    detailDescription?: string;
    price: number;
    priceUnit: string;
    imageUrl: string;
    categorySlug: string;
    isHot?: boolean;
    isFeatured?: boolean;
    sortOrder?: number;
  };

  const products: SeedProduct[] = [
    {
      name: "Tăng Follow Facebook",
      slug: "tang-follow-facebook",
      sku: "FB-FLW-10K",
      shortDescription:
        "Gói 10.000 follow người dùng thật, bảo hành tụt vĩnh viễn.",
      detailDescription:
        "Tối ưu cho Fanpage và profile cá nhân. Tiến độ tùy chọn.",
      price: 100_000,
      priceUnit: "/ gói",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBCL-YbfisBqEBhk5M2vPLDeHlQ3RhaLvLk09ktlv5-5gUCGAVfYwG_1N7MHjuNIcs9nGFf2PmGhkmYiCBoqiIFTydNvDGN8u8HYm4tsmG8vdRh7u_ifMMxhtm3SQO6oDZbk_UB1H5Vgr_buefCtT2xhkno9REALHrOnS_08D8-cImlzQVu1kTBW7PfI-24aXU9KY8eUO_-Ccg4oaqjcLmm0OPfDgD7wN0qyLv63iG5nhfGZch2zvZrQCwwb0iihZ6-kiu1Ehcz9aJT",
      categorySlug: "facebook",
      isHot: true,
      isFeatured: true,
      sortOrder: 0,
    },
    {
      name: "Tăng Like Fanpage",
      slug: "tang-like-fanpage",
      sku: "FB-LIKE-1K",
      shortDescription:
        "Cải thiện độ uy tín cho doanh nghiệp với lượt like thật 100%.",
      price: 45_000,
      priceUnit: "/ 1k like",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBCL-YbfisBqEBhk5M2vPLDeHlQ3RhaLvLk09ktlv5-5gUCGAVfYwG_1N7MHjuNIcs9nGFf2PmGhkmYiCBoqiIFTydNvDGN8u8HYm4tsmG8vdRh7u_ifMMxhtm3SQO6oDZbk_UB1H5Vgr_buefCtT2xhkno9REALHrOnS_08D8-cImlzQVu1kTBW7PfI-24aXU9KY8eUO_-Ccg4oaqjcLmm0OPfDgD7wN0qyLv63iG5nhfGZch2zvZrQCwwb0iihZ6-kiu1Ehcz9aJT",
      categorySlug: "facebook",
      sortOrder: 1,
    },
    {
      name: "Tăng Follow TikTok",
      slug: "tang-follow-tiktok",
      sku: "TT-FLW",
      shortDescription:
        "Tăng follow TikTok nhanh chóng, lên xu hướng dễ hơn.",
      price: 89_000,
      priceUnit: "/ gói",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDmjUsyrX100NgvPZPrA7S-5IxyQ9lSf7dPzpdL2408Vh5rLs5wrGavjfTQ2VoprccrI0VJTh5OG5mQnnN_Z2CNHzFfLbJ9b_aL7cdW48m6GaKmsw4yQrffeHI03bClyUPXkis0fb_ikvdgFWEJalHX5OLtenMnlZLlNhS8EuX4RtatJ6pYC98pcGwOT9c-2ES8J07QBABq1ncQxusqNFtOW485G7Ygy6AKScKmBD4D1eA6d2K4OhcJ2ICJUc-Xlv28r5utBRa_VuK3",
      categorySlug: "tiktok",
      isHot: true,
      sortOrder: 0,
    },
    {
      name: "Tăng View TikTok",
      slug: "tang-view-tiktok",
      sku: "TT-VIEW-1M",
      shortDescription: "1.000.000 views nhanh—phù hợp clip viral.",
      price: 150_000,
      priceUnit: "/ gói",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDmjUsyrX100NgvPZPrA7S-5IxyQ9lSf7dPzpdL2408Vh5rLs5wrGavjfTQ2VoprccrI0VJTh5OG5mQnnN_Z2CNHzFfLbJ9b_aL7cdW48m6GaKmsw4yQrffeHI03bClyUPXkis0fb_ikvdgFWEJalHX5OLtenMnlZLlNhS8EuX4RtatJ6pYC98pcGwOT9c-2ES8J07QBABq1ncQxusqNFtOW485G7Ygy6AKScKmBD4D1eA6d2K4OhcJ2ICJUc-Xlv28r5utBRa_VuK3",
      categorySlug: "tiktok",
      sortOrder: 1,
    },
    {
      name: "Tăng Subscribe YouTube",
      slug: "tang-subscribe-youtube",
      sku: "YT-SUB",
      shortDescription:
        "Tăng subscriber kênh YouTube chất lượng, ít drop.",
      price: 120_000,
      priceUnit: "/ gói",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBUjC-MYDoT6BAPOluAp1x1xoJ9KKtytGy1Hocr96LpcR-FCnAexITEia0Kn8nTX2Ul6br5EciUMMnOO4go7c3dc9qqQylNnuIP8xYwE6d-4P5VaE7fxsleFlmPmmqyR9sowYLj-_B4nA6QsNrs-c_FuJavGYTgGrxn8IkXjQEb_kOOr7yT5TU2Kyjb9nEGVLZqLX5fjjNXK2wIdEZ7OmsfbpAZbXMWwuNYNkft6ci0IVFfdTDuZhh7IWAIKY-Uakf03hj1wOHRbVgz",
      categorySlug: "youtube",
      sortOrder: 0,
    },
    {
      name: "Tài khoản Canva Pro",
      slug: "tai-khoan-canva-pro",
      sku: "PM-CANVA",
      shortDescription: "Canva Pro 1 năm—thích hợp team nhỏ / cá nhân.",
      price: 290_000,
      priceUnit: "/ năm",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB-G9H-xM-rxXrtwJj4e5Mqaym48AwyaHkbjEwINZfSCFONC7qbH6-qAKjcJDeHrU0BI5ccpN98rAoO91OXiRLF66kdWC_MxM8weoNLdH2Ziz35TBwZ0e7laSx6YdYhfIyknbyGKzXJyDXOagzzmRXPpODvjsPrcnQ5sg8QYz_MIDcO9x7FPErDmIX9C5bHMwBuNk0nyUVubQeA_llGeTKC6NIggk6PW8PndVW3Keu4bo3Nwyl_G1ol8COYs3cES3Q6oK-hfG5lFjeK",
      categorySlug: "phan-mem-tien-ich",
      sortOrder: 0,
    },
    {
      name: "Tài khoản Netflix",
      slug: "tai-khoan-netflix",
      sku: "TK-NETFLIX",
      shortDescription: "Netflix Premium 4K HDR—gói 1 tháng.",
      price: 99_000,
      priceUnit: "/ tháng",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBUjC-MYDoT6BAPOluAp1x1xoJ9KKtytGy1Hocr96LpcR-FCnAexITEia0Kn8nTX2Ul6br5EciUMMnOO4go7c3dc9qqQylNnuIP8xYwE6d-4P5VaE7fxsleFlmPmmqyR9sowYLj-_B4nA6QsNrs-c_FuJavGYTgGrxn8IkXjQEb_kOOr7yT5TU2Kyjb9nEGVLZqLX5fjjNXK2wIdEZ7OmsfbpAZbXMWwuNYNkft6ci0IVFfdTDuZhh7IWAIKY-Uakf03hj1wOHRbVgz",
      categorySlug: "tai-khoan-so",
      isHot: true,
      sortOrder: 0,
    },
    {
      name: "Tài khoản ChatGPT",
      slug: "tai-khoan-chatgpt",
      sku: "TK-CHATGPT",
      shortDescription: "ChatGPT Plus—tài khoản chính chủ (theo slot).",
      price: 199_000,
      priceUnit: "/ tháng",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB-G9H-xM-rxXrtwJj4e5Mqaym48AwyaHkbjEwINZfSCFONC7qbH6-qAKjcJDeHrU0BI5ccpN98rAoO91OXiRLF66kdWC_MxM8weoNLdH2Ziz35TBwZ0e7laSx6YdYhfIyknbyGKzXJyDXOagzzmRXPpODvjsPrcnQ5sg8QYz_MIDcO9x7FPErDmIX9C5bHMwBuNk0nyUVubQeA_llGeTKC6NIggk6PW8PndVW3Keu4bo3Nwyl_G1ol8COYs3cES3Q6oK-hfG5lFjeK",
      categorySlug: "tai-khoan-so",
      sortOrder: 1,
    },
  ];

  for (const p of products) {
    const categoryId = categoryRecords[p.categorySlug];
    if (!categoryId) {
      throw new Error(`Missing category for ${p.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        sku: p.sku ?? null,
        shortDescription: p.shortDescription,
        detailDescription: p.detailDescription ?? null,
        price: p.price,
        priceUnit: p.priceUnit,
        imageUrl: p.imageUrl,
        categoryId,
        isHot: p.isHot ?? false,
        isFeatured: p.isFeatured ?? false,
        isVisible: true,
        sortOrder: p.sortOrder ?? 0,
      },
      create: {
        name: p.name,
        slug: p.slug,
        sku: p.sku ?? null,
        shortDescription: p.shortDescription,
        detailDescription: p.detailDescription ?? null,
        price: p.price,
        priceUnit: p.priceUnit,
        imageUrl: p.imageUrl,
        categoryId,
        isHot: p.isHot ?? false,
        isFeatured: p.isFeatured ?? false,
        isVisible: true,
        sortOrder: p.sortOrder ?? 0,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
