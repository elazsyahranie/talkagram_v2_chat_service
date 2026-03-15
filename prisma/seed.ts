import { Prisma, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
// import { v4 as uuidv4 } from 'uuid';
// import { Knex, knex } from 'knex';

const prisma = new PrismaClient();

async function main() {
  // Users Seeders
  const users: Prisma.UsersCreateInput[] = [];
  const password = await bcrypt.hash('123456', 10);
  for (let i = 0; i < 50; i++) {
    const first_name = faker.person.firstName();
    const middle_name = faker.person.middleName();
    const last_name = faker.person.lastName();
    const name = `${first_name} ${middle_name} ${last_name}`;
    const username = name.toLowerCase().replaceAll(' ', '_');
    const email = name.toLowerCase().replaceAll(' ', '_') + '@yopmail.com';
    const phone = '08' + faker.phone.number().replace(/[^0-9]/g, '');

    const role = i < 5 ? 'Super Admin' : 'User';
    users.push({
      email,
      name,
      first_name,
      middle_name,
      last_name,
      username,
      password,
      role,
      phone,
    });
  }

  await prisma.users.createMany({
    data: users,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
