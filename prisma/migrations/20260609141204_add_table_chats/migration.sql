-- CreateTable
CREATE TABLE "Chats" (
    "id" VARCHAR(255) NOT NULL,
    "sender" VARCHAR(255) NOT NULL,
    "chat" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_sender_fkey" FOREIGN KEY ("sender") REFERENCES "RoomParticipants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
