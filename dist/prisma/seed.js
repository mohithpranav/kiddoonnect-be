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
const client_1 = require("@prisma/client");
const hospital_1 = require("../types/hospital");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting seeding...");
        try {
            // Clear existing data
            console.log("Clearing existing data...");
            yield prisma.hospital.deleteMany();
            yield prisma.hospitalData.deleteMany();
            // Seed hospital data
            console.log("Seeding hospital data...");
            for (const hospital of hospital_1.hospitals) {
                yield prisma.hospitalData.create({
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
        }
        catch (error) {
            console.error("Error during seeding:", error);
            throw error;
        }
    });
}
main()
    .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
