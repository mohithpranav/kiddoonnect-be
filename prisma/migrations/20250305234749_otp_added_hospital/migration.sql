/*
  Warnings:

  - You are about to drop the column `address` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `doctorID` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Hospital` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slno]` on the table `Hospital` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slno` to the `Hospital` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Hospital_phone_key";

-- AlterTable
ALTER TABLE "Hospital" DROP COLUMN "address",
DROP COLUMN "doctorID",
DROP COLUMN "phone",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "slno" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Hospital_slno_key" ON "Hospital"("slno");
