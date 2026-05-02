/*
  Warnings:

  - You are about to alter the column `room_id` on the `RoomParticipants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "RoomParticipants" DROP CONSTRAINT "RoomParticipants_room_id_fkey";

-- AlterTable
ALTER TABLE "RoomParticipants" ALTER COLUMN "room_id" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "RoomParticipants" ADD CONSTRAINT "RoomParticipants_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
