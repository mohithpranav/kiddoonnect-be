import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const addChildRecord = async (req: Request, res: Response): Promise<any> => {
  try {
    const { hospitalId } = req.query;
    const { title, date, childId, category, note, document, doctorName } =
      req.body;

    // Validate required fields
    if (
      !title ||
      !date ||
      !childId ||
      !category ||
      !hospitalId ||
      !doctorName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if child exists
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      return res.status(404).json({ message: "Child not found" });
    }

    // Check if hospital exists
    const hospital = await prisma.hospital.findUnique({
      where: { id: hospitalId as string },
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    // Create the record
    const record = await prisma.record.create({
      data: {
        title,
        createdAt: new Date(date),
        category,
        note,
        document,
        hospitalID: hospitalId as string,
        doctor_Name: doctorName, // Ensure doctor name is included
        childId: childId, // Use childId directly
      },
    });

    return res
      .status(201)
      .json({ message: "Record added successfully", record });
  } catch (error) {
    console.error("Add child record error:", error);
    return res
      .status(500)
      .json({ message: "Failed to add record", error: (error as any).message });
  }
};

export { addChildRecord };
