-- CreateTable
CREATE TABLE "HospitalData" (
    "slno" INTEGER NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "HospitalData_pkey" PRIMARY KEY ("slno")
);

-- CreateIndex
CREATE UNIQUE INDEX "HospitalData_slno_key" ON "HospitalData"("slno");

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_slno_fkey" FOREIGN KEY ("slno") REFERENCES "HospitalData"("slno") ON DELETE RESTRICT ON UPDATE CASCADE;
