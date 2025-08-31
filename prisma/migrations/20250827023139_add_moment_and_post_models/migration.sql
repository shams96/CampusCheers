/*
  Warnings:

  - You are about to drop the `CheersMoment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CheersMoment" DROP CONSTRAINT "CheersMoment_userId_fkey";

-- DropTable
DROP TABLE "public"."CheersMoment";

-- CreateTable
CREATE TABLE "public"."Moment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Moment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "momentId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isFront" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Moment" ADD CONSTRAINT "Moment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_momentId_fkey" FOREIGN KEY ("momentId") REFERENCES "public"."Moment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
