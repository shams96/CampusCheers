const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create test school
  const school = await prisma.school.upsert({
    where: { domain: 'test.edu' },
    update: {},
    create: {
      name: 'Test University',
      domain: 'test.edu',
    },
  });

  console.log('Created school:', school);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });