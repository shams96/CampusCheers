-- First, we need to drop the existing foreign key constraints
-- For Moment table
ALTER TABLE "Moment" DROP CONSTRAINT IF EXISTS "Moment_userId_fkey";

-- For Post table
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_momentId_fkey";

-- For HypeRound table
ALTER TABLE "HypeRound" DROP CONSTRAINT IF EXISTS "HypeRound_userId_fkey";

-- For PollVote table
ALTER TABLE "PollVote" DROP CONSTRAINT IF EXISTS "PollVote_voterId_fkey";
ALTER TABLE "PollVote" DROP CONSTRAINT IF EXISTS "PollVote_recipientId_fkey";
ALTER TABLE "PollVote" DROP CONSTRAINT IF EXISTS "PollVote_hypeRoundId_fkey";

-- For Friendship table
ALTER TABLE "Friendship" DROP CONSTRAINT IF EXISTS "Friendship_user1Id_fkey";
ALTER TABLE "Friendship" DROP CONSTRAINT IF EXISTS "Friendship_user2Id_fkey";

-- Now drop the existing primary key constraints and add the composite ones
-- For User table
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id", "schoolId");

-- For Moment table
ALTER TABLE "Moment" DROP CONSTRAINT IF EXISTS "Moment_pkey";
ALTER TABLE "Moment" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
-- Update schoolId for existing moments based on user's school
UPDATE "Moment" SET "schoolId" = (SELECT "schoolId" FROM "User" WHERE "User"."id" = "Moment"."userId");
-- For moments that don't have a user, set a default schoolId
UPDATE "Moment" SET "schoolId" = 'default' WHERE "schoolId" IS NULL;
ALTER TABLE "Moment" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "Moment" ADD CONSTRAINT "Moment_pkey" PRIMARY KEY ("id", "userId");

-- For Post table
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_pkey";
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "momentUserId" TEXT;
-- Update momentUserId for existing posts based on moment's user
UPDATE "Post" SET "momentUserId" = (SELECT "userId" FROM "Moment" WHERE "Moment"."id" = "Post"."momentId");
-- For posts that don't have a moment, set a default momentUserId
UPDATE "Post" SET "momentUserId" = 'default' WHERE "momentUserId" IS NULL;
ALTER TABLE "Post" ALTER COLUMN "momentUserId" SET NOT NULL;
ALTER TABLE "Post" ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("id", "momentId");

-- For HypeRound table
ALTER TABLE "HypeRound" DROP CONSTRAINT IF EXISTS "HypeRound_pkey";
ALTER TABLE "HypeRound" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
-- Update schoolId for existing hype rounds based on user's school
UPDATE "HypeRound" SET "schoolId" = (SELECT "schoolId" FROM "User" WHERE "User"."id" = "HypeRound"."userId");
-- For hype rounds that don't have a user, set a default schoolId
UPDATE "HypeRound" SET "schoolId" = 'default' WHERE "schoolId" IS NULL;
ALTER TABLE "HypeRound" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "HypeRound" ADD CONSTRAINT "HypeRound_pkey" PRIMARY KEY ("id", "userId");

-- For PollVote table
ALTER TABLE "PollVote" DROP CONSTRAINT IF EXISTS "PollVote_pkey";
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "voterSchoolId" TEXT;
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "recipientSchoolId" TEXT;
ALTER TABLE "PollVote" ADD COLUMN IF NOT EXISTS "hypeRoundUserId" TEXT;
-- Update schoolId fields for existing poll votes
UPDATE "PollVote" SET 
  "voterSchoolId" = (SELECT "schoolId" FROM "User" WHERE "User"."id" = "PollVote"."voterId");
UPDATE "PollVote" SET 
  "recipientSchoolId" = (SELECT "schoolId" FROM "User" WHERE "User"."id" = "PollVote"."recipientId");
UPDATE "PollVote" SET 
  "hypeRoundUserId" = (SELECT "userId" FROM "HypeRound" WHERE "HypeRound"."id" = "PollVote"."hypeRoundId");
-- For poll votes that don't have users or hype rounds, set default values
UPDATE "PollVote" SET "voterSchoolId" = 'default' WHERE "voterSchoolId" IS NULL;
UPDATE "PollVote" SET "recipientSchoolId" = 'default' WHERE "recipientSchoolId" IS NULL;
UPDATE "PollVote" SET "hypeRoundUserId" = 'default' WHERE "hypeRoundUserId" IS NULL;
ALTER TABLE "PollVote" ALTER COLUMN "voterSchoolId" SET NOT NULL;
ALTER TABLE "PollVote" ALTER COLUMN "recipientSchoolId" SET NOT NULL;
ALTER TABLE "PollVote" ALTER COLUMN "hypeRoundUserId" SET NOT NULL;
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id", "recipientId");

-- For Friendship table
ALTER TABLE "Friendship" DROP CONSTRAINT IF EXISTS "Friendship_pkey";
ALTER TABLE "Friendship" ADD COLUMN IF NOT EXISTS "user1SchoolId" TEXT;
ALTER TABLE "Friendship" ADD COLUMN IF NOT EXISTS "user2SchoolId" TEXT;
-- Update schoolId fields for existing friendships
UPDATE "Friendship" SET 
  "user1SchoolId" = (SELECT "schoolId" FROM "User" WHERE "User"."id" = "Friendship"."user1Id");
UPDATE "Friendship" SET 
  "user2SchoolId" = (SELECT "schoolId" FROM "User" WHERE "User"."id" = "Friendship"."user2Id");
-- For friendships that don't have users, set default values
UPDATE "Friendship" SET "user1SchoolId" = 'default' WHERE "user1SchoolId" IS NULL;
UPDATE "Friendship" SET "user2SchoolId" = 'default' WHERE "user2SchoolId" IS NULL;
ALTER TABLE "Friendship" ALTER COLUMN "user1SchoolId" SET NOT NULL;
ALTER TABLE "Friendship" ALTER COLUMN "user2SchoolId" SET NOT NULL;
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id", "user1Id");

-- Now add the foreign key constraints with the composite keys
-- For Moment table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Moment_userId_schoolId_fkey') THEN
    ALTER TABLE "Moment" ADD CONSTRAINT "Moment_userId_schoolId_fkey" 
      FOREIGN KEY ("userId", "schoolId") REFERENCES "User"("id", "schoolId");
  END IF;
END $$;

-- For Post table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_momentId_momentUserId_fkey') THEN
    ALTER TABLE "Post" ADD CONSTRAINT "Post_momentId_momentUserId_fkey" 
      FOREIGN KEY ("momentId", "momentUserId") REFERENCES "Moment"("id", "userId");
  END IF;
END $$;

-- For HypeRound table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'HypeRound_userId_schoolId_fkey') THEN
    ALTER TABLE "HypeRound" ADD CONSTRAINT "HypeRound_userId_schoolId_fkey" 
      FOREIGN KEY ("userId", "schoolId") REFERENCES "User"("id", "schoolId");
  END IF;
END $$;

-- For PollVote table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PollVote_voterId_voterSchoolId_fkey') THEN
    ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_voterId_voterSchoolId_fkey" 
      FOREIGN KEY ("voterId", "voterSchoolId") REFERENCES "User"("id", "schoolId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PollVote_recipientId_recipientSchoolId_fkey') THEN
    ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_recipientId_recipientSchoolId_fkey" 
      FOREIGN KEY ("recipientId", "recipientSchoolId") REFERENCES "User"("id", "schoolId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PollVote_hypeRoundId_hypeRoundUserId_fkey') THEN
    ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_hypeRoundId_hypeRoundUserId_fkey" 
      FOREIGN KEY ("hypeRoundId", "hypeRoundUserId") REFERENCES "HypeRound"("id", "userId");
  END IF;
END $$;

-- For Friendship table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Friendship_user1Id_user1SchoolId_fkey') THEN
    ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user1Id_user1SchoolId_fkey" 
      FOREIGN KEY ("user1Id", "user1SchoolId") REFERENCES "User"("id", "schoolId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Friendship_user2Id_user2SchoolId_fkey') THEN
    ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user2Id_user2SchoolId_fkey" 
      FOREIGN KEY ("user2Id", "user2SchoolId") REFERENCES "User"("id", "schoolId");
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "User_schoolId_idx" ON "User"("schoolId");
CREATE INDEX IF NOT EXISTS "Moment_userId_idx" ON "Moment"("userId");
CREATE INDEX IF NOT EXISTS "Post_momentId_idx" ON "Post"("momentId");
CREATE INDEX IF NOT EXISTS "HypeRound_userId_idx" ON "HypeRound"("userId");
CREATE INDEX IF NOT EXISTS "PollVote_recipientId_idx" ON "PollVote"("recipientId");
CREATE INDEX IF NOT EXISTS "PollVote_voterId_idx" ON "PollVote"("voterId");
CREATE INDEX IF NOT EXISTS "PollVote_hypeRoundId_idx" ON "PollVote"("hypeRoundId");
CREATE INDEX IF NOT EXISTS "Friendship_user1Id_idx" ON "Friendship"("user1Id");
CREATE INDEX IF NOT EXISTS "Friendship_user2Id_idx" ON "Friendship"("user2Id");