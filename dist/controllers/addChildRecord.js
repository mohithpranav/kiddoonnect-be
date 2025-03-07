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
exports.addChildRecord = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../utils/cloudinary");
const multer_1 = __importDefault(require("multer"));
const prisma = new client_1.PrismaClient();
const upload = (0, multer_1.default)({ dest: "uploads/" }); // Configure multer as needed
const addChildRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, childId, category, date, notes } = req.body;
        const file = req.file; // TypeScript now allows this
        if (!title || !childId || !category || !date || !file) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Upload file to Cloudinary
        const fileUrl = yield (0, cloudinary_1.uploadToCloudinary)(file.path);
        // Save record to database
        const record = yield prisma.record.create({
            data: {
                title,
                childId,
                category,
                date: new Date(date),
                note: notes,
                document: fileUrl,
                child: { connect: { id: childId } },
                doctor: { connect: { id: "doctorId" } },
            },
        });
        return res
            .status(201)
            .json({ message: "Record added successfully", record });
    }
    catch (error) {
        console.error("Add record error:", error);
        return res.status(500).json({
            message: "Failed to add record",
            error: error.message,
        });
    }
});
exports.addChildRecord = addChildRecord;
