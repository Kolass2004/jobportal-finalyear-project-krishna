import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

/**
 * This script dumps tables from local dev.db and recreates them on Turso,
 * then copies all data over.
 */

// Source: local SQLite
const localAdapter = new PrismaLibSql({ url: 'file:./dev.db' });
const localPrisma = new PrismaClient({ adapter: localAdapter } as any);

// Target: Turso cloud
const tursoUrl = process.env.DATABASE_URL!;
const tursoToken = process.env.TURSO_AUTH_TOKEN!;

if (!tursoUrl.startsWith('libsql://')) {
  console.error('❌ DATABASE_URL must be a libsql:// Turso URL');
  process.exit(1);
}

const tursoAdapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
const tursoPrisma = new PrismaClient({ adapter: tursoAdapter } as any);

async function main() {
  console.log('🔗 Connecting to local dev.db and Turso...');

  // Test Turso connection with a raw query
  try {
    await tursoPrisma.$executeRawUnsafe('SELECT 1');
    console.log('✅ Turso connection successful!');
  } catch (err) {
    console.error('❌ Cannot connect to Turso:', err);
    process.exit(1);
  }

  // Step 1: Get the schema SQL from local database
  console.log('\n📋 Extracting schema from local database...');

  // We'll use Prisma's $queryRawUnsafe to get the schema
  const tables: any[] = await localPrisma.$queryRawUnsafe(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name`
  );

  console.log(`   Found ${tables.length} tables: ${tables.map(t => t.name).join(', ')}`);

  // Step 2: Get indexes
  const indexes: any[] = await localPrisma.$queryRawUnsafe(
    `SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'`
  );

  // Step 3: Create tables on Turso
  console.log('\n🏗️  Creating tables on Turso...');
  for (const table of tables) {
    try {
      await tursoPrisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table.name}"`);
      await tursoPrisma.$executeRawUnsafe(table.sql);
      console.log(`   ✅ ${table.name}`);
    } catch (err: any) {
      console.error(`   ❌ ${table.name}: ${err.message}`);
    }
  }

  // Step 4: Create indexes
  console.log('\n📇 Creating indexes...');
  for (const idx of indexes) {
    try {
      await tursoPrisma.$executeRawUnsafe(idx.sql);
      console.log(`   ✅ ${idx.name}`);
    } catch (err: any) {
      console.error(`   ❌ ${idx.name}: ${err.message}`);
    }
  }

  // Step 5: Copy data from local to Turso
  console.log('\n📦 Copying data...');

  // Copy in dependency order
  const copyOrder = [
    'User',
    'JobseekerProfile',
    'Company',
    'Job',
    'Application',
    'SavedJob',
    'Post',
    'PostLike',
    'Comment',
    'Conversation',
    'ConversationParticipant',
    'Message',
    'Notification',
  ];

  for (const modelName of copyOrder) {
    try {
      const records = await (localPrisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)].findMany();
      if (records.length === 0) {
        console.log(`   ⏭️  ${modelName}: 0 records`);
        continue;
      }

      let count = 0;
      for (const record of records) {
        try {
          await (tursoPrisma as any)[modelName.charAt(0).toLowerCase() + modelName.slice(1)].create({ data: record });
          count++;
        } catch (err: any) {
          // Skip duplicates
          if (!err.message?.includes('UNIQUE')) {
            console.error(`   ⚠️  ${modelName} insert error:`, err.message?.slice(0, 80));
          }
        }
      }
      console.log(`   ✅ ${modelName}: ${count}/${records.length} records`);
    } catch (err: any) {
      console.error(`   ❌ ${modelName}: ${err.message?.slice(0, 80)}`);
    }
  }

  // Also create the _prisma_migrations table
  console.log('\n📋 Setting up Prisma migrations table...');
  try {
    await tursoPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "checksum" TEXT NOT NULL,
        "finished_at" DATETIME,
        "migration_name" TEXT NOT NULL,
        "logs" TEXT,
        "rolled_back_at" DATETIME,
        "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log('   ✅ _prisma_migrations table created');
  } catch (err: any) {
    console.log('   ⏭️  Already exists');
  }

  console.log('\n🎉 Migration to Turso complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await localPrisma.$disconnect();
    await tursoPrisma.$disconnect();
  });
