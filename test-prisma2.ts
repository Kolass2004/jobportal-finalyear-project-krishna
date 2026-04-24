import { PrismaClient } from './src/generated/prisma/client';
console.log(Object.keys(new PrismaClient({ adapter: {} as any })));
