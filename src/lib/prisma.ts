import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaClient: PrismaClient;

if (!globalForPrisma.prisma) {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const adapter = new PrismaLibSql({ url: dbUrl });
  prismaClient = new PrismaClient({ adapter } as any);

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
  }
} else {
  prismaClient = globalForPrisma.prisma;
}

export const prisma = prismaClient;
export default prisma;
