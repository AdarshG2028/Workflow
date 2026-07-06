import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

export const prismaClient = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
export * from "@prisma/client";

