-- CreateEnum
CREATE TYPE "category" AS ENUM ('Vaccination', 'Doctor_Visit', 'Lab_Test', 'Prescription');

-- CreateEnum
CREATE TYPE "childRecord" AS ENUM ('School_Record', 'Activity_Record');

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "motherName" TEXT NOT NULL,
    "age" INTEGER,
    "aadhar_Number" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profilepic" TEXT,
    "BloodGroup" TEXT NOT NULL,
    "DOB" TIMESTAMP(3) NOT NULL,
    "birthmark" TEXT NOT NULL,
    "allergies" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childRecord" "childRecord" NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "doctorID" TEXT NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "childId" TEXT NOT NULL,
    "doctor_Name" TEXT NOT NULL,
    "category" "category" NOT NULL,
    "Note" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "doctorID" TEXT NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upcoming_Activity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "childID" TEXT NOT NULL,

    CONSTRAINT "Upcoming_Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upcoming_Activity" ADD CONSTRAINT "Upcoming_Activity_childID_fkey" FOREIGN KEY ("childID") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
