/*
  Warnings:

  - Added the required column `room_id` to the `Chats` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chats" ADD COLUMN     "room_id" VARCHAR(255) NOT NULL;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
