/*
  Warnings:

  - Made the column `status` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `ProjectMember` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isOnline` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProjectMember" ALTER COLUMN "role" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "isOnline" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;
