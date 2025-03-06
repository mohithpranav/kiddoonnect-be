-- AlterTable
CREATE SEQUENCE hospitaldata_slno_seq;
ALTER TABLE "HospitalData" ALTER COLUMN "slno" SET DEFAULT nextval('hospitaldata_slno_seq');
ALTER SEQUENCE hospitaldata_slno_seq OWNED BY "HospitalData"."slno";
