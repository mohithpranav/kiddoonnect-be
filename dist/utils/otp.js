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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtp = exports.generateOtp = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Generate OTP and store in the database
const generateOtp = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Check if parent exists
    const parent = yield prisma.parent.findUnique({
        where: { email },
    });
    if (parent) {
        // Update OTP if parent exists
        yield prisma.parent.update({
            where: { email },
            data: { otp },
        });
    }
    else {
        throw new Error("Parent not found");
    }
    return otp;
});
exports.generateOtp = generateOtp;
// Verify OTP function
const verifyOtp = (email, inputOtp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.parent.findUnique({
        where: { email },
    });
    if (user && user.otp === inputOtp) {
        yield prisma.parent.update({
            where: { email },
            data: { otp: null, isVerified: true },
        });
        return true;
    }
    return false;
});
exports.verifyOtp = verifyOtp;
