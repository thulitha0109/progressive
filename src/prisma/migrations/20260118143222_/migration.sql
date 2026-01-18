-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'Asia/Colombo';

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "label" TEXT,
ADD COLUMN     "timeZone" TEXT NOT NULL DEFAULT 'Asia/Colombo';

-- CreateTable
CREATE TABLE "_UserPodcastLikes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserPodcastLikes_AB_unique" ON "_UserPodcastLikes"("A", "B");

-- CreateIndex
CREATE INDEX "_UserPodcastLikes_B_index" ON "_UserPodcastLikes"("B");

-- AddForeignKey
ALTER TABLE "_UserPodcastLikes" ADD CONSTRAINT "_UserPodcastLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPodcastLikes" ADD CONSTRAINT "_UserPodcastLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
