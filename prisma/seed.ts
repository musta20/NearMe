import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        passwordHash: await bcrypt.hash("password123", 10),
        phoneNumber: faker.phone.number(),
      },
    });
    users.push(user);
  }

  // Create products
  const products = [];
  for (let i = 0; i < 50; i++) {
    const product = await prisma.product.create({
      data: {
        sellerId: faker.helpers.arrayElement(users).id,
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        latitude: parseFloat(faker.location.latitude()),
        longitude: parseFloat(faker.location.longitude()),
        address: faker.location.streetAddress(),
      },
    });
    products.push(product);

    // Create product images
    const imageCount = faker.number.int({ min: 1, max: 5 });
    for (let j = 0; j < imageCount; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: faker.image.url(),
          order: j,
          isPrimary: j === 0,
        },
      });
    }
  }

  // Create favorites
  for (let i = 0; i < 100; i++) {
    await prisma.favorite.create({
      data: {
        userId: faker.helpers.arrayElement(users).id,
        productId: faker.helpers.arrayElement(products).id,
      },
    }).catch(() => {
      // Ignore unique constraint violations
    });
  }

  // Create messages
  for (let i = 0; i < 200; i++) {
    const [sender, receiver] = faker.helpers.arrayElements(users, 2);
    await prisma.message.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        productId: faker.helpers.arrayElement(products).id,
        content: faker.lorem.paragraph(),
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });