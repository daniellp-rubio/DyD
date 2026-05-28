-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "ProductRatings" ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "verifiedBuyer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ProductRatings_productId_status_idx" ON "ProductRatings"("productId", "status");
