import { PrismaClient } from "@prisma/client";
import { hospitals } from "../types/hospital";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.hospital.deleteMany();
    await prisma.hospitalData.deleteMany();

    // Seed hospital data
    console.log("Seeding hospital data...");
    for (const hospital of hospitals) {
      await prisma.hospitalData.create({
        data: {
          slno: hospital.slno,
          hospital_name: hospital.hospital_name,
          zone: hospital.zone,
          ward: hospital.ward,
          address: hospital.address,
        },
      });
      console.log(`Created hospital data: ${hospital.hospital_name}`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
