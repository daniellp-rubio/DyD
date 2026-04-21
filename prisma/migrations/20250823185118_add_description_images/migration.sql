/*
  Warnings:

  - A unique constraint covering the columns `[contentId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "contentId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "descriptionImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Product_contentId_key" ON "Product"("contentId");
