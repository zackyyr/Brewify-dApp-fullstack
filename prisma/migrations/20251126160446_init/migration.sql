-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageCid" TEXT NOT NULL,
    "metadataCid" TEXT NOT NULL,
    "priceEth" DOUBLE PRECISION,
    "origin" TEXT,
    "process" TEXT,
    "quantity" INTEGER NOT NULL,
    "harvested" TEXT,
    "roasted" TEXT,
    "packed" TEXT,
    "slug" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
