-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "latest_chat_id" VARCHAR(255);

-- AddForeignKey
ALTER TABLE "Rooms" ADD CONSTRAINT "Rooms_latest_chat_id_fkey" FOREIGN KEY ("latest_chat_id") REFERENCES "Chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
