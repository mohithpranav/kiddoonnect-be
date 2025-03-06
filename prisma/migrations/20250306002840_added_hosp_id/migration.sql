/*
  Warnings:

  - You are about to drop the column `doctorID` on the `Record` table. All the data in the column will be lost.
  - Added the required column `hospitalID` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "doctorID",
ADD COLUMN     "hospitalID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_hospitalID_fkey" FOREIGN KEY ("hospitalID") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
