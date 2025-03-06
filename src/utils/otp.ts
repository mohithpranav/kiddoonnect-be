import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Generate OTP and store in the database
export const generateOtp = async (email: string): Promise<string> => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Check if parent exists
  const parent = await prisma.parent.findUnique({
    where: { email },
  });

  if (parent) {
    // Update OTP if parent exists
    await prisma.parent.update({
      where: { email },
      data: { otp },
    });
  } else {
    throw new Error("Parent not found");
  }

  return otp;
};

// Verify OTP function
export const verifyOtp = async (
  email: string,
  inputOtp: string
): Promise<boolean> => {
  const user = await prisma.parent.findUnique({
    where: { email },
  });

  if (user && user.otp === inputOtp) {
    await prisma.parent.update({
      where: { email },
      data: { otp: null, isVerified: true },
    });
    return true;
  }

  return false;
};
