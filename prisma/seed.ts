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

  /** Xóa sản phẩm demo cũ (nếu DB đã từng seed bản có mẫu). */
  const legacyExampleSlugs = [
    "tang-follow-facebook",
    "tang-like-fanpage",
    "tang-follow-tiktok",
    "tang-view-tiktok",
    "tang-subscribe-youtube",
    "tai-khoan-canva-pro",
    "tai-khoan-netflix",
    "tai-khoan-chatgpt",
  ] as const;

  await prisma.product.deleteMany({
    where: { slug: { in: [...legacyExampleSlugs] } },
  });
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
