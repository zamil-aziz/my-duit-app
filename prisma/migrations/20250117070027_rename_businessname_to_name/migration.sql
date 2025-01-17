/*
  Warnings:

  - You are about to drop the column `businessname` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_businessname_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "businessname",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "user_name_idx" ON "user"("name");
