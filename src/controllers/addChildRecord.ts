import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { uploadToCloudinary } from "../utils/cloudinary";
import multer from "multer";

// Extend the Request type to include the optional file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const prisma = new PrismaClient();

const upload = multer({ dest: "uploads/" }); // Configure multer as needed

const addChildRecord = async (
  req: MulterRequest,
  res: Response
): Promise<any> => {
  try {
    const { title, childId, category, date, notes } = req.body;
    const file = req.file; // TypeScript now allows this

    if (!title || !childId || !category || !date || !file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Upload file to Cloudinary
    const fileUrl = await uploadToCloudinary(file.path);

    // Save record to database
    const record = await prisma.record.create({
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
  } catch (error) {
    console.error("Add record error:", error);
    return res.status(500).json({
      message: "Failed to add record",
      error: (error as Error).message,
    });
  }
};

export { addChildRecord };
