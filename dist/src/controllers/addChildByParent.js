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
exports.addChildByParent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addChildByParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.query;
        const { name, fatherName, motherName, BloodGroup, allergies, DOB, profilepic, birthmark, aadhar_Number, } = req.body;
        // Validate required fields
        if (!name || !DOB || !parentId) {
            return res.status(400).json({
                message: "Name, Date of Birth, and Parent ID are required",
            });
        }
        // Check if parent exists
        const parent = yield prisma.parent.findUnique({
            where: { id: parentId },
        });
        if (!parent) {
            return res.status(404).json({
                message: "Parent not found",
            });
        }
        // Check if Aadhar number is unique
        const existingChild = yield prisma.child.findUnique({
            where: { aadhar_Number },
        });
        if (existingChild) {
            return res.status(400).json({
                message: "Aadhar number already exists",
            });
        }
        // Create the child
        const child = yield prisma.child.create({
            data: {
                name,
                fatherName,
                motherName,
                BloodGroup,
                allergies,
                DOB: new Date(DOB),
                profilepic,
                birthmark,
                aadhar_Number,
                parentID: parentId, // Ensure parentId is included in the child creation data
            },
        });
        return res.status(201).json({
            message: "Child added successfully",
            child,
        });
    }
    catch (error) {
        console.error("Add child error:", error);
        return res.status(500).json({
            message: "Failed to add child",
            error: error.message,
        });
    }
});
exports.addChildByParent = addChildByParent;
