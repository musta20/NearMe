import { PrismaClient } from "@prisma/client";
import { faker } from '@faker-js/faker';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create categories
  const categorySet = new Set();
  const categories = [];
  while (categorySet.size < 10) {
    const categoryName = faker.commerce.department();
    if (!categorySet.has(categoryName)) {
      categorySet.add(categoryName);
      const category = await prisma.categories.create({
        data: {
          name: categoryName
        },
      });
      categories.push(category);
    }
  }

  console.log("✅ Categories seeded");

  //Francisca.Bailey@hotmail.com
  // Create users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        bio: faker.person.bio(),
        name: faker.person.fullName(),
        avatarImage: faker.image.avatar(),
        address: faker.location.streetAddress(),
        passwordHash: await bcrypt.hash("password123", 10),
        phoneNumber: faker.phone.number(),
      },
    });
    users.push(user);
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      username: "admin",
      bio: faker.person.bio(),
      name: "admin",
      avatarImage: faker.image.avatar(),
      address: faker.location.streetAddress(),
      passwordHash: await bcrypt.hash("Aa123456", 10),
      phoneNumber: faker.phone.number(),
    },
  });
  users.push(admin);

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
    // ... (keep the existing function as is)
  }

  // Create products
  const products = [];

  // Create 20 products for each user
  for (const user of users) {
    for (let i = 0; i < 20; i++) {
      const { latitude, longitude } = generateRandomCoordinate(29.0586624, 31.1263232, 5);
      const product = await prisma.product.create({
        data: {
          sellerId: user.id,
          categoryId: faker.helpers.arrayElement(categories).id,
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          inStock: faker.helpers.arrayElement([true, false]),
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
  }
  console.log("✅ productImage seeded");
 
  console.log("✅ Products and images seeded");

  console.log("✅ Seed favorite successfully!");

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
  console.log("✅ favorite seeded");

  console.log("✅ Seed favorite successfully!");
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
  console.log("✅ message seeded");

  console.log("✅ Seed completed successfully!");

  // Create ratings
  for (let i = 0; i < 300; i++) {
    const user = faker.helpers.arrayElement(users);
    const product = faker.helpers.arrayElement(products);
    
    await prisma.rating.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }),
      },
    }).catch(() => {
      // Ignore unique constraint violations
    });
  }

  console.log("✅ Ratings seeded");

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