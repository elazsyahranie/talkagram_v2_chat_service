BEGIN;

ALTER TABLE "Chats"
DROP CONSTRAINT "type_check";

ALTER TABLE "Chats"
ADD CONSTRAINT "type_check" CHECK ("type" IN ('Chat', 'File'));

COMMIT;