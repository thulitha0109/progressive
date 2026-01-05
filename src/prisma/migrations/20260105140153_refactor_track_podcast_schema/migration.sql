/*
  Warnings:

  - You are about to drop the column `sequence` on the `Track` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Warm';

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "sequence",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Original Mix';
