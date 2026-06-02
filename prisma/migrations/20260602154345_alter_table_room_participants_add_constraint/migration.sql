-- This is an empty migration.
ALTER TABLE "RoomParticipants"
ADD CONSTRAINT "role_check"
CHECK ("role" IN ('Admin', 'User'));