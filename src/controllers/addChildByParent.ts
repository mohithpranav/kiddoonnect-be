import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const addChildByParent = async (req: Request, res: Response): Promise<any> => {
  try {
    const { parentId } = req.params;
    const {
      name,
      fatherName,
      motherName,
      BloodGroup,
      allergies,
      DOB,
      profilepic,
      birthmark,
      aadhar_Number,
    } = req.body;

    // Validate required fields
    if (!name || !DOB || !parentId) {
      return res.status(400).json({
        message: "Name, Date of Birth, and Parent ID are required",
      });
    }

    // Check if parent exists
    const parent = await prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      return res.status(404).json({
        message: "Parent not found",
      });
    }

    // Check if Aadhar number is unique (if provided)
    if (aadhar_Number) {
      const existingChild = await prisma.child.findUnique({
        where: { aadhar_Number },
      });

      if (existingChild) {
        return res.status(400).json({
          message: "Aadhar number already exists",
        });
      }
    }

    // Create the child
    const child = await prisma.child.create({
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
        parentID: parentId,
      },
    });

    return res.status(201).json({
      message: "Child added successfully",
      child,
    });
  } catch (error) {
    console.error("Add child error:", error);
    return res.status(500).json({
      message: "Failed to add child",
      error: (error as any).message,
    });
  }
};

export { addChildByParent };
