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
exports.resendOtphospital = exports.hospitalSignin = exports.verifyOtpControllerhospital = exports.hospitalSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const email_1 = require("../utils/email");
const hospitalOtp_1 = require("../utils/hospitalOtp");
const hospitalData_1 = __importDefault(require("./hospitalData"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
// Step 1: Store hospital data in the database and send OTP
const hospitalSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, slno } = req.body;
        // Validate required fields
        if (!name || !slno || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }
        // Check if hospital exists in the provided data
        const hospitalData = hospitalData_1.default.hospitals.find((h) => h.slno === slno && h.hospital_name === name);
        if (!hospitalData) {
            return res.status(400).json({
                message: "Invalid hospital ID or name",
            });
        }
        // Check if hospital already exists
        const existingHospital = yield prisma.hospital.findFirst({
            where: {
                OR: [{ email }, { slno }],
            },
        });
        if (existingHospital) {
            return res.status(400).json({
                message: existingHospital.email === email
                    ? "Email already registered"
                    : "Hospital ID already registered",
            });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create hospital in the database with OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hospital = yield prisma.hospital.create({
            data: {
                name,
                slno,
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
exports.hospitalSignup = hospitalSignup;
// Step 2: Verify OTP and create hospital
const verifyOtpControllerhospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }
        // Verify OTP
        const isValid = yield (0, hospitalOtp_1.verifyOtp)(email, otp);
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }
        // Retrieve hospital data from the database
        const hospital = yield prisma.hospital.findUnique({
            where: { email },
        });
        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found",
            });
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ hospitalId: hospital.id }, JWT_SECRET, {
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
    }
    catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({
            message: "Verification failed",
            error: error.message,
        });
    }
});
exports.verifyOtpControllerhospital = verifyOtpControllerhospital;
// Step 3: Sign in
const hospitalSignin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        // Check if hospital exists
        const hospital = yield prisma.hospital.findUnique({
            where: { email },
        });
        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found",
            });
        }
        // Compare password
        const isMatch = yield bcrypt_1.default.compare(password, hospital.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ hospitalId: hospital.id }, JWT_SECRET, {
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
    }
    catch (error) {
        console.error("Signin error:", error);
        return res.status(500).json({
            message: "Signin failed",
            error: error.message,
        });
    }
});
exports.hospitalSignin = hospitalSignin;
const resendOtphospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }
        // Check if hospital exists
        const hospital = yield prisma.hospital.findUnique({
            where: { email },
        });
        if (!hospital) {
            return res.status(404).json({
                message: "No account found with this email",
            });
        }
        // Generate and send new OTP
        const otp = yield (0, hospitalOtp_1.generateOtp)(email);
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
exports.resendOtphospital = resendOtphospital;
