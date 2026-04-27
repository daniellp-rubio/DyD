-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ProductRatings" (
    "id" SERIAL NOT NULL,
    "comment" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProductRatings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductRatings_userId_key" ON "ProductRatings"("userId");

-- AddForeignKey
ALTER TABLE "ProductRatings" ADD CONSTRAINT "ProductRatings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRatings" ADD CONSTRAINT "ProductRatings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
