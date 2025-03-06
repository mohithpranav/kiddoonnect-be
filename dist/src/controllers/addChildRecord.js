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
exports.addChildRecord = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addChildRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hospitalId } = req.query;
        const { title, date, childId, category, note, document, doctorName } = req.body;
        // Validate required fields
        if (!title ||
            !date ||
            !childId ||
            !category ||
            !hospitalId ||
            !doctorName) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // Check if child exists
        const child = yield prisma.child.findUnique({
            where: { id: childId },
        });
        if (!child) {
            return res.status(404).json({ message: "Child not found" });
        }
        // Check if hospital exists
        const hospital = yield prisma.hospital.findUnique({
            where: { id: hospitalId },
        });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }
        // Create the record
        const record = yield prisma.record.create({
            data: {
                title,
                createdAt: new Date(date),
                category,
                note,
                document,
                hospitalID: hospitalId,
                doctor_Name: doctorName, // Ensure doctor name is included
                childId: childId, // Use childId directly
            },
        });
        return res
            .status(201)
            .json({ message: "Record added successfully", record });
    }
    catch (error) {
        console.error("Add child record error:", error);
        return res
            .status(500)
            .json({ message: "Failed to add record", error: error.message });
    }
});
exports.addChildRecord = addChildRecord;
