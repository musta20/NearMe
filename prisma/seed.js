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

  function generateRandomCoordinate(centerLat, centerLon, radiusInKm) {
    const earthRadiusKm = 6371;
    
    // Convert radius from kilometers to radians
    const radiusInRadians = radiusInKm / earthRadiusKm;
    
    // Generate a random angle in radians
    const randomAngle = Math.random() * 2 * Math.PI;
    
    // Generate a random distance within the radius
    const randomDistance = Math.random() * radiusInRadians;
    
    // Convert center point to radians
    const centerLatRad = centerLat * (Math.PI / 180);
    const centerLonRad = centerLon * (Math.PI / 180);
    
    // Calculate new latitude
    const newLatRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(randomDistance) +
      Math.cos(centerLatRad) * Math.sin(randomDistance) * Math.cos(randomAngle)
    );
    
    // Calculate new longitude
    const newLonRad = centerLonRad + Math.atan2(
      Math.sin(randomAngle) * Math.sin(randomDistance) * Math.cos(centerLatRad),
      Math.cos(randomDistance) - Math.sin(centerLatRad) * Math.sin(newLatRad)
    );
    
    // Convert back to degrees
    const newLat = newLatRad * (180 / Math.PI);
    const newLon = newLonRad * (180 / Math.PI);
    
    return { latitude: newLat, longitude: newLon };
  }

  // Create products
  const products = [];
  for (let i = 0; i < 50; i++) {
    const { latitude, longitude } = generateRandomCoordinate(29.0586624, 31.1263232, 5);
    const product = await prisma.product.create({
      data: {
        sellerId: faker.helpers.arrayElement(users).id,
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        latitude: latitude,
        longitude: longitude,
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
    console.error("An error occurred during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });