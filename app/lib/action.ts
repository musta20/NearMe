import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Zod Schemas
const UserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
});

const ProductSchema = z.object({
  sellerId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string(),
  price: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
});

const ProductImageSchema = z.object({
  productId: z.string().uuid(),
  imageUrl: z.string().url(),
  order: z.number().int().nonnegative(),
  isPrimary: z.boolean(),
});

const FavoriteSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
});

const MessageSchema = z.object({
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  productId: z.string().uuid(),
  content: z.string().min(1),
});

// User CRUD
export async function createUser(data: z.infer<typeof UserSchema>) {
  const validatedData = UserSchema.parse(data);
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);
  return prisma.user.create({
    data: {
      ...validatedData,
      passwordHash: hashedPassword,
    },
  });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(id: string, data: Partial<z.infer<typeof UserSchema>>) {
  const validatedData = UserSchema.partial().parse(data);
  if (validatedData.password) {
    validatedData.passwordHash = await bcrypt.hash(validatedData.password, 10);
    delete validatedData.password;
  }
  return prisma.user.update({ where: { id }, data: validatedData });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

// Product CRUD
export async function createProduct(data: z.infer<typeof ProductSchema>) {
  const validatedData = ProductSchema.parse(data);
  return prisma.product.create({ data: validatedData });
}

export async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function updateProduct(id: string, data: Partial<z.infer<typeof ProductSchema>>) {
  const validatedData = ProductSchema.partial().parse(data);
  return prisma.product.update({ where: { id }, data: validatedData });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

// Product Image CRUD
export async function createProductImage(data: z.infer<typeof ProductImageSchema>) {
  const validatedData = ProductImageSchema.parse(data);
  return prisma.productImage.create({ data: validatedData });
}

export async function getProductImage(id: string) {
  return prisma.productImage.findUnique({ where: { id } });
}

export async function updateProductImage(id: string, data: Partial<z.infer<typeof ProductImageSchema>>) {
  const validatedData = ProductImageSchema.partial().parse(data);
  return prisma.productImage.update({ where: { id }, data: validatedData });
}

export async function deleteProductImage(id: string) {
  return prisma.productImage.delete({ where: { id } });
}

// Favorite CRUD
export async function createFavorite(data: z.infer<typeof FavoriteSchema>) {
  const validatedData = FavoriteSchema.parse(data);
  return prisma.favorite.create({ data: validatedData });
}

export async function getFavorite(id: string) {
  return prisma.favorite.findUnique({ where: { id } });
}

export async function deleteFavorite(id: string) {
  return prisma.favorite.delete({ where: { id } });
}

// Message CRUD
export async function createMessage(data: z.infer<typeof MessageSchema>) {
  const validatedData = MessageSchema.parse(data);
  return prisma.message.create({ data: validatedData });
}

export async function getMessage(id: string) {
  return prisma.message.findUnique({ where: { id } });
}

export async function updateMessage(id: string, data: Partial<z.infer<typeof MessageSchema>>) {
  const validatedData = MessageSchema.partial().parse(data);
  return prisma.message.update({ where: { id }, data: validatedData });
}

export async function deleteMessage(id: string) {
  return prisma.message.delete({ where: { id } });
}

// Additional utility functions

export async function getUserProducts(userId: string) {
  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: 'desc' },
  });

  return products.map(product => ({
    ...product,
    price: parseFloat(product.price.toString())
  }));
}

export async function getUserFavorites(userId: string) {
  return prisma.favorite.findMany({ 
    where: { userId },
    include: { product: true }
  });
}

export async function getProductMessages(productId: string) {
  return prisma.message.findMany({ where: { productId } });
}

export async function searchProducts(query: string) {
  return prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
}

// New function to get all products
export async function getAllProductsOld() {
  return prisma.product.findMany({
    include: {
      seller: {
        select: {
          id: true,
          username: true,
        },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

const PaginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  });
  
  export async function getAllProducts(options?: z.infer<typeof PaginationSchema>) {
    const { page, limit } = PaginationSchema.parse(options || {});
    const skip = (page - 1) * limit;
  
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.product.count(),
    ]);
  
    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

// Add this new login function
export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    //console.log('Invalid email or password')
    throw new Error("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error("Invalid email or password");
  }

  // Return user without passwordHash
  const { passwordHash, ...userWithoutPassword } = user;
 
  return userWithoutPassword;
}