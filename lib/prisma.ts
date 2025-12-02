import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL

  if (!url) {
    console.warn("DATABASE_URL is missing from environment variables")
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: url || "",
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
