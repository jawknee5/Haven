import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log(`[ZERG] Seeding Database in ${process.env.NODE_ENV} mode...`);
  await prisma.need.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({ data: { email: 'admin@pathway.gov', role: 'ADMIN' } });
  await prisma.resource.create({ data: { name: 'Emergency Shelter A', type: 'SHELTER', capacity: 50 } });
  console.log('[ZERG] Database successfully seeded.');
}

main().catch(e => {
  console.error('[ZERG] ERROR SEEDING:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
