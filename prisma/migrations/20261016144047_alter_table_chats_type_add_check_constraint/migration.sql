ALTER TABLE "Chats"
ADD CONSTRAINT "type_check"
CHECK ("type" IN ('Chat', 'Image'));