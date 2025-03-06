/*
  Warnings:

  - A unique constraint covering the columns `[aadhar_Number]` on the table `Child` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Child_aadhar_Number_key" ON "Child"("aadhar_Number");
