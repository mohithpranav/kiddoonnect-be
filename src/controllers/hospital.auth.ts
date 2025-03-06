import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/email";
import { generateOtp, verifyOtp } from "../utils/hospitalOtp";
import hospitalsData from "./hospitalData";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Step 1: Store hospital data in the database and send OTP
const hospitalSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name, slno } = req.body;

    // Validate required fields
    if (!name || !slno || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if hospital exists in the provided data
    const hospitalData = hospitalsData.hospitals.find(
      (h) => h.slno === slno && h.hospital_name === name
    );

    if (!hospitalData) {
      return res.status(400).json({
        message: "Invalid hospital ID or name",
      });
    }

    // Check if hospital already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: {
        OR: [{ email }, { slno }],
      },
    });

    if (existingHospital) {
      return res.status(400).json({
        message:
          existingHospital.email === email
            ? "Email already registered"
            : "Hospital ID already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create hospital in the database with OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hospital = await prisma.hospital.create({
      data: {
        name,
        slno,
        email,
        password: hashedPassword,
        otp,
      },
    });

    // Send OTP via email
    await sendEmail(
      email,
      "Verify Your Email",
      `Welcome to Child Connect! Your verification code is: ${otp}`
    );

    return res.status(201).json({
      message: "Please verify your email to complete signup",
      email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Signup failed",
      error: (error as any).message,
    });
  }
};

// Step 2: Verify OTP and create hospital
const verifyOtpControllerhospital = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Verify OTP
    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Retrieve hospital data from the database
    const hospital = await prisma.hospital.findUnique({
      where: { email },
    });

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ hospitalId: hospital.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Email verified successfully",
      token,
      hospital: {
        id: hospital.id,
        email: hospital.email,
        name: hospital.name,
        slno: hospital.slno,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: "Verification failed",
      error: (error as any).message,
    });
  }
};

// Step 3: Sign in
const hospitalSignin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { email },
    });

    if (!hospital) {
      return res.status(404).json({
        message: "Hospital not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ hospitalId: hospital.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Signin successful",
      token,
      hospital: {
        id: hospital.id,
        email: hospital.email,
        name: hospital.name,
        slno: hospital.slno,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({
      message: "Signin failed",
      error: (error as any).message,
    });
  }
};

const resendOtphospital = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { email },
    });

    if (!hospital) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate and send new OTP
    const otp = await generateOtp(email);
    await sendEmail(
      email,
      "Your New Verification Code",
      `Your new verification code is: ${otp}`
    );

    return res.status(200).json({
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      message: "Failed to resend OTP",
      error: (error as any).message,
    });
  }
};

export {
  hospitalSignup,
  verifyOtpControllerhospital,
  hospitalSignin,
  resendOtphospital,
};
