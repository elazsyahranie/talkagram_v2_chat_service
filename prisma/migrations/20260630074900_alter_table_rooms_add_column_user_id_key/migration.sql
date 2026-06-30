/*
  Warnings:

  - A unique constraint covering the columns `[user_id_key]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "user_id_key" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Rooms_user_id_key_key" ON "Rooms"("user_id_key");
