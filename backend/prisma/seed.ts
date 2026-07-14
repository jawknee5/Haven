import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log(`[HAVEN] Seeding Database in ${process.env.NODE_ENV} mode...`);
  await prisma.need.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({ data: { email: 'admin@haven.demo', role: 'ADMIN' } });
  await prisma.resource.create({ data: { name: 'Emergency Shelter A', type: 'SHELTER', capacity: 50 } });
  console.log('[HAVEN] Database successfully seeded.');
}

main().catch(e => {
  console.error('[HAVEN] ERROR SEEDING:', e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
