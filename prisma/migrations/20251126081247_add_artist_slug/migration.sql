/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Artist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");
