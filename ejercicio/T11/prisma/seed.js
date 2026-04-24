import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = (value) => bcrypt.hash(value, 10);

const main = async () => {
  await prisma.review.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const [adminPassword, librarianPassword, userPassword] = await Promise.all([
    hashPassword('Admin1234'),
    hashPassword('Library1234'),
    hashPassword('User12345'),
  ]);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@library.test',
        name: 'Admin',
        password: adminPassword,
        role: 'ADMIN',
      },
      {
        email: 'librarian@library.test',
        name: 'Librarian',
        password: librarianPassword,
        role: 'LIBRARIAN',
      },
      {
        email: 'reader@library.test',
        name: 'Reader',
        password: userPassword,
        role: 'USER',
      },
    ],
  });

  await prisma.book.createMany({
    data: [
      {
        isbn: '9780307474278',
        title: 'The Road',
        author: 'Cormac McCarthy',
        genre: 'Fiction',
        description: 'A post-apocalyptic novel.',
        publishedYear: 2006,
        copies: 4,
        available: 4,
      },
      {
        isbn: '9780061120084',
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        genre: 'Classic',
        description: 'A novel about justice and empathy.',
        publishedYear: 1960,
        copies: 3,
        available: 3,
      },
      {
        isbn: '9780141187761',
        title: 'Nineteen Eighty-Four',
        author: 'George Orwell',
        genre: 'Dystopian',
        description: 'A dystopian political novel.',
        publishedYear: 1949,
        copies: 5,
        available: 5,
      },
    ],
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
