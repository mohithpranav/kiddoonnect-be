/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Child` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Child` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Hospital` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Hospital` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "fatherName" SET DEFAULT '',
ALTER COLUMN "motherName" SET DEFAULT '',
ALTER COLUMN "aadhar_Number" SET DEFAULT '',
ALTER COLUMN "BloodGroup" SET DEFAULT '',
ALTER COLUMN "birthmark" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Child_phone_key" ON "Child"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Child_email_key" ON "Child"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_phone_key" ON "Hospital"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_email_key" ON "Hospital"("email");
