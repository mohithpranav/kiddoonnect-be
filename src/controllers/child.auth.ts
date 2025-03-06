import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../utils/email";
import { generateOtp, verifyOtp } from "../utils/otp";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Step 1: Store user data in the database and send OTP
const childSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.parent.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Phone number already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database with OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const user = await prisma.parent.create({
      data: {
        name,
        phone,
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

// Step 2: Verify OTP and create user
const verifyOtpController = async (
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

    // Retrieve user data from the database
    const user = await prisma.parent.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
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
const childSignin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Check if user exists
    const user = await prisma.parent.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Signin successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
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

// Resend OTP
const resendOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await prisma.parent.findUnique({
      where: { email },
    });

    if (!user) {
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

// Initiate forgot password process
const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await prisma.parent.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    // Generate and send OTP
    const otp = await generateOtp(email);
    await sendEmail(
      email,
      "Password Reset Request",
      `Your password reset code is: ${otp}`
    );

    return res.status(200).json({
      message: "Password reset code sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Failed to process request",
      error: (error as any).message,
    });
  }
};

// Verify reset OTP
const verifyResetOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Generate a temporary reset token
    const resetToken = jwt.sign(
      { email, purpose: "reset" },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({
      message: "Failed to verify OTP",
      error: (error as any).message,
    });
  }
};

// Reset password
const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Verify reset token
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET!) as {
        email: string;
        purpose: string;
      };

      if (decoded.email !== email || decoded.purpose !== "reset") {
        return res.status(401).json({
          message: "Invalid reset token",
        });
      }
    } catch (err) {
      return res.status(401).json({
        message: "Reset session expired",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.parent.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Failed to reset password",
      error: (error as any).message,
    });
  }
};

export {
  childSignup,
  childSignin,
  verifyOtpController,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
