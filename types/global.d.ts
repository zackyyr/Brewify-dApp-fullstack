import { PrismaClient } from "@/app/generated/prisma"

declare global {
  var prisma: PrismaClient | undefined
}
