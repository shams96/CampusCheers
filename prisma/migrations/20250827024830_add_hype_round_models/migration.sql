/*
  Warnings:

  - You are about to drop the column `answer1` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `answer2` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `answer3` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `question1` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `question2` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `question3` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `HypeRound` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `HypeRound` table. All the data in the column will be lost.
  - Added the required column `userId` to the `HypeRound` table without a default value. This is not possible if the table is not empty.

*/
TRUNCATE TABLE "public"."HypeRound";

-- DropForeignKey
ALTER TABLE "public"."HypeRound" DROP CONSTRAINT "HypeRound_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HypeRound" DROP CONSTRAINT "HypeRound_senderId_fkey";

-- AlterTable
ALTER TABLE "public"."HypeRound" DROP COLUMN "answer1",
DROP COLUMN "answer2",
DROP COLUMN "answer3",
DROP COLUMN "question1",
DROP COLUMN "question2",
DROP COLUMN "question3",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."PollQuestion" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "theme" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PollVote" (
    "id" TEXT NOT NULL,
    "pollQuestionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "hypeRoundId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PollVote" ADD CONSTRAINT "PollVote_pollQuestionId_fkey" FOREIGN KEY ("pollQuestionId") REFERENCES "public"."PollQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollVote" ADD CONSTRAINT "PollVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollVote" ADD CONSTRAINT "PollVote_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollVote" ADD CONSTRAINT "PollVote_hypeRoundId_fkey" FOREIGN KEY ("hypeRoundId") REFERENCES "public"."HypeRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HypeRound" ADD CONSTRAINT "HypeRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
