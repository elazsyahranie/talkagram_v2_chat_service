-- This is an empty migration.
ALTER TABLE "Rooms"
ADD CONSTRAINT "type_check"
CHECK ("type" IN ('Personal Chat', 'Group'));