-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "duration" INTEGER,
    "durationUnit" TEXT,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

CREATE INDEX "ProductVariant_productId_sortOrder_idx" ON "ProductVariant"("productId", "sortOrder");

ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Mỗi sản phẩm hiện có → một biến thể mặc định (giữ giá & đơn vị cũ)
INSERT INTO "ProductVariant" ("id", "productId", "label", "duration", "durationUnit", "price", "originalPrice", "note", "sortOrder", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  p."id",
  CASE
    WHEN NULLIF(trim(p."priceUnit"), '') IS NULL THEN 'Mặc định'
    ELSE trim(p."priceUnit")
  END,
  NULL,
  NULL,
  p."price",
  NULL,
  NULL,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Product" p;
