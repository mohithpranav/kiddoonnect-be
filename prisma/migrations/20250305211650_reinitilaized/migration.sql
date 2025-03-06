/*
  Warnings:

  - You are about to drop the column `age` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `childRecord` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Child` table. All the data in the column will be lost.
  - Added the required column `parentID` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Child_email_key";

-- DropIndex
DROP INDEX "Child_phone_key";

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "age",
DROP COLUMN "childRecord",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "phone",
DROP COLUMN "updatedAt",
ADD COLUMN     "parentID" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "childRecord" "childRecord",

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_phone_key" ON "Parent"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentID_fkey" FOREIGN KEY ("parentID") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
