import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Generate OTP and store in the database
export const generateOtp = async (email: string): Promise<string> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Check if hospital exists
  const hospital = await prisma.hospital.findUnique({
    where: { email },
  });

  if (hospital) {
    // Update OTP if hospital exists
    await prisma.hospital.update({
      where: { email },
      data: { otp },
    });
  } else {
    throw new Error("Hospital not found");
  }

  return otp;
};

// Verify OTP function
export const verifyOtp = async (
  email: string,
  inputOtp: string
): Promise<boolean> => {
  const hospital = await prisma.hospital.findUnique({
    where: { email },
  });

  if (hospital && hospital.otp === inputOtp) {
    await prisma.hospital.update({
      where: { email },
      data: { otp: null, isVerified: true },
    });
    return true;
  }

  return false;
};
