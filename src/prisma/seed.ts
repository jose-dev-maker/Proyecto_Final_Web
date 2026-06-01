import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Sembrando datos iniciales...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('operator123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stockflow.com' },
    update: {},
    create: {
      email: 'admin@stockflow.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@stockflow.com' },
    update: {},
    create: {
      email: 'operator@stockflow.com',
      password: operatorPassword,
      role: 'OPERATOR',
    },
  });

  const electronics = await prisma.category.upsert({
    where: { name: 'Electrónica' },
    update: {},
    create: { name: 'Electrónica' },
  });

  const office = await prisma.category.upsert({
    where: { name: 'Oficina' },
    update: {},
    create: { name: 'Oficina' },
  });

  await prisma.product.upsert({
    where: { sku: 'LAPTOP-001' },
    update: {},
    create: {
      name: 'Laptop Dell Inspiron',
      sku: 'LAPTOP-001',
      stock: 15,
      minStock: 5,
      price: 750.0,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'MOUSE-002' },
    update: {},
    create: {
      name: 'Mouse Inalámbrico',
      sku: 'MOUSE-002',
      stock: 3,
      minStock: 5,
      price: 25.0,
      categoryId: electronics.id,
    },
  });

  await prisma.product.upsert({
    where: { sku: 'CHAIR-003' },
    update: {},
    create: {
      name: 'Silla Ergonómica',
      sku: 'CHAIR-003',
      stock: 8,
      minStock: 2,
      price: 180.0,
      categoryId: office.id,
    },
  });

  console.log(' Seed completado');
  console.log(`   Admin: admin@stockflow.com / admin123`);
  console.log(`   Operator: operator@stockflow.com / operator123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
