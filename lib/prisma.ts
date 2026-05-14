import { PrismaPg } from "@prisma/adapter-pg";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@/app/generated/prisma/client";

/** Base client instance type (avoids TS union incompatibilities from `$extends(withAccelerate())`). */
export type AppPrismaClient = InstanceType<typeof PrismaClient>;

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (url.startsWith("prisma+postgres://")) {
    return new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate());
  }

  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Use in route handlers when Turbopack cannot merge extended client call signatures. */
export const prismaDb: AppPrismaClient = prisma as unknown as AppPrismaClient;
