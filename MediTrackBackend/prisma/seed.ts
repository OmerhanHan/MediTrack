import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { hashPassword } from '../src/common/password.js';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://meditrack:meditrack_dev_2026@localhost:5432/meditrack',
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create demo users with hashed passwords
  const hashedPassword = await hashPassword('Password123!');

  const doctor = await prisma.user.upsert({
    where: { email: 'doktor@meditrack.app' },
    update: {},
    create: {
      email: 'doktor@meditrack.app',
      passwordHash: hashedPassword,
      role: 'doctor',
      firstName: 'Selin',
      lastName: 'Yılmaz',
      title: 'Uzman Doktor',
      department: 'Kardiyoloji',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'personel@meditrack.app' },
    update: {},
    create: {
      email: 'personel@meditrack.app',
      passwordHash: hashedPassword,
      role: 'staff',
      firstName: 'Ayşe',
      lastName: 'Kara',
      title: 'Klinik Personeli',
      department: 'Kardiyoloji',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@meditrack.app' },
    update: {},
    create: {
      email: 'admin@meditrack.app',
      passwordHash: hashedPassword,
      role: 'admin',
      firstName: 'Mehmet',
      lastName: 'Demir',
      title: 'Sistem Yöneticisi',
      department: 'IT',
    },
  });

  console.log('Created users:', { doctor: doctor.email, staff: staff.email, admin: admin.email });
  console.log('Demo credentials: any-email@meditrack.app / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
