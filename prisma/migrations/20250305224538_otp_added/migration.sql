-- AlterTable
ALTER TABLE "Hospital" ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp" TEXT;
