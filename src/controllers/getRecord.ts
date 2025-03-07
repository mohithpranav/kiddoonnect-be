import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getRecord = async (req: any, res: any): Promise<any> => {
  try {
    const { childId } = req.params;
    const record = await prisma.record.findMany({
      where: {
        childId: childId,
      },
    });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: "Failed to get record" });
  }
};

export default getRecord;
