"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetOtp = exports.forgotPassword = exports.resendOtp = exports.verifyOtpController = exports.childSignin = exports.childSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const email_1 = require("../utils/email");
const otp_1 = require("../utils/otp");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
// Step 1: Store user data in the database and send OTP
const childSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phone } = req.body;
        // Validate required fields
        if (!name || !phone || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        // Check if user already exists
        const existingUser = yield prisma.parent.findFirst({
            where: {
                OR: [{ email }, { phone }],
            },
        });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email
                    ? "Email already registered"
                    : "Phone number already taken",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user in the database with OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const user = yield prisma.parent.create({
            data: {
                name,
                phone,
                email,
                password: hashedPassword,
                otp,
            },
        });
        // Send OTP via email
        yield (0, email_1.sendEmail)(email, "Verify Your Email", `Welcome to Child Connect! Your verification code is: ${otp}`);
        return res.status(201).json({
            message: "Please verify your email to complete signup",
            email,
        });
    }
    catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Signup failed",
            error: error.message,
        });
    }
});
exports.childSignup = childSignup;
// Step 2: Verify OTP and create user
const verifyOtpController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }
        // Verify OTP
        const isValid = yield (0, otp_1.verifyOtp)(email, otp);
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }
        // Retrieve user data from the database
        const user = yield prisma.parent.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
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
    }
    catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({
            message: "Verification failed",
            error: error.message,
        });
    }
});
exports.verifyOtpController = verifyOtpController;
// Step 3: Sign in
const childSignin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        // Check if user exists
        const user = yield prisma.parent.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        // Compare password
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, {
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
    }
    catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({
            message: "Signin failed",
            error: error.message,
        });
    }
});
exports.childSignin = childSignin;
// Resend OTP
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }
        // Check if user exists
        const user = yield prisma.parent.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email",
            });
        }
        // Generate and send new OTP
        const otp = yield (0, otp_1.generateOtp)(email);
        yield (0, email_1.sendEmail)(email, "Your New Verification Code", `Your new verification code is: ${otp}`);
        return res.status(200).json({
            message: "New OTP sent successfully",
        });
    }
    catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({
            message: "Failed to resend OTP",
            error: error.message,
        });
    }
});
exports.resendOtp = resendOtp;
// Initiate forgot password process
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }
        // Check if user exists
        const user = yield prisma.parent.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                message: "No account found with this email",
            });
        }
        // Generate and send OTP
        const otp = yield (0, otp_1.generateOtp)(email);
        yield (0, email_1.sendEmail)(email, "Password Reset Request", `Your password reset code is: ${otp}`);
        return res.status(200).json({
            message: "Password reset code sent to your email",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            message: "Failed to process request",
            error: error.message,
        });
    }
});
exports.forgotPassword = forgotPassword;
// Verify reset OTP
const verifyResetOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }
        const isValid = yield (0, otp_1.verifyOtp)(email, otp);
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }
        // Generate a temporary reset token
        const resetToken = jsonwebtoken_1.default.sign({ email, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "5m" });
        return res.status(200).json({
            message: "OTP verified successfully",
            resetToken,
        });
    }
    catch (error) {
        console.error("Verify reset OTP error:", error);
        return res.status(500).json({
            message: "Failed to verify OTP",
            error: error.message,
        });
    }
});
exports.verifyResetOtp = verifyResetOtp;
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, resetToken, newPassword } = req.body;
        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        // Verify reset token
        try {
            const decoded = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_SECRET);
            if (decoded.email !== email || decoded.purpose !== "reset") {
                return res.status(401).json({
                    message: "Invalid reset token",
                });
            }
        }
        catch (err) {
            return res.status(401).json({
                message: "Reset session expired",
            });
        }
        // Update password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield prisma.parent.update({
            where: { email },
            data: { password: hashedPassword },
        });
        return res.status(200).json({
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            message: "Failed to reset password",
            error: error.message,
        });
    }
});
exports.resetPassword = resetPassword;
