import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import fs from 'fs/promises';
import path from 'path';
 
const prisma = new PrismaClient();

// Zod Schemas
const UserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  phoneNumber: z.string().optional(),
  avatarImage: z.string()
});

const ProductSchema = z.object({
  sellerId: z.string().uuid(),
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string(),
  price: z.number().positive(),
  inStock: z.boolean(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
});

const ProductImageSchema = z.object({
  productId: z.string().uuid(),
  imageUrl: z.string(),
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

// Rating Schema
const RatingSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  value: z.number().int().min(1).max(5),
  comment: z.string().optional(),
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
export async function createProduct(data: any) {
  const validatedData = ProductSchema.parse(data);
  return prisma.product.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,
      price: validatedData.price,
      inStock: validatedData.inStock,
      latitude: validatedData.latitude,
      longitude: validatedData.longitude,
      address: validatedData.address,
      seller: {
        connect: { id: validatedData.sellerId }
      },
      category: {
        connect: { id: validatedData.categoryId }
      }
    },
  });
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      category: true,
      ratings: {
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      },
      seller: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  // Calculate average rating
  const averageRating = product.ratings.length > 0
    ? calCaverageRating(product)
    : null;

  return {
    ...product,
    averageRating,
  };
}

export async function getFavotite(userId: string){
     return prisma.product.findMany({
    include:{  images: {
        where: { isPrimary: true },
        take: 1,
      }},
    where: {
      
      favorites: {
        some: {
          userId: userId,
        },
            },
      
    }
  });
}

// export async function updateProduct(id: string, data: z.infer<typeof ProductUpdateSchema>) {
//   const validatedData = ProductUpdateSchema.parse(data);
//   return prisma.product.update({
//     where: { id },
//     data: validatedData,
//   });
// }

export async function deleteProduct(id: string) {
  // Start a transaction to ensure all operations succeed or fail together
  return prisma.$transaction(async (tx) => {
    // Delete all related product images
    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    // Delete all related favorites
    await tx.favorite.deleteMany({
      where: { productId: id },
    });

    // Delete all related messages
    await tx.message.deleteMany({
      where: { productId: id },
    });

    // Finally, delete the product itself
    const deletedProduct = await tx.product.delete({
      where: { id },
    });

    return deletedProduct;
  });
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

export async function deleteProductImageOld(id: string) {
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
  const products = await prisma.product.findMany({
    include: {
      seller: {
        select: {
          id: true,
          username: true,
        },
      },
      images: {
        orderBy: [
          { isPrimary: 'desc' },
          { order: 'asc' }
        ]
      },
      ratings: {
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      },
    },
    take: 20, // Limit to 20 records
    orderBy: {
      createdAt: 'desc',
    },
  });

  return products.map(product => ({
    ...product,
    averageRating: product.ratings && product.ratings.length > 0
      ? calCaverageRating(product)
      : null,
  }));
}
const calCaverageRating = (product: any)=>{
 //const val = Number((product.ratings.reduce((sum, rating) => sum + rating.value, 0) / product.ratings.length).toFixed(1))
 if (product.ratings.length === 0) return 0;
 const sum = product.ratings.reduce((acc, rating) => acc + rating.rating, 0);

 return sum / product.ratings.length;
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

export async function getAllCategories() {
  return prisma.categories.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getProductImages(productId: string) {
  return prisma.productImage.findMany({
    where: { productId },
    orderBy: { order: 'asc' },
  });
}

export async function setPrimaryProductImage(imageId: string, productId: string) {
  return prisma.$transaction(async (tx) => {
    // Unset the current primary image
    await tx.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Set the new primary image
    const updatedImage = await tx.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    return updatedImage;
  });
}

export async function deleteProductImage(imageId: string, productId: string) {
  return prisma.$transaction(async (tx) => {
    // Get the image details
    const image = await tx.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new Error("Image not found");
    }

    // Delete the image file if it exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filename = path.basename(image.imageUrl);
    const filePath = path.join(uploadDir, filename);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting image file:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete the image from the database
    const deletedImage = await tx.productImage.delete({
      where: { id: imageId },
    });

    // If the deleted image was primary, set a new primary image
    if (deletedImage.isPrimary) {
      const nextImage = await tx.productImage.findFirst({
        where: { productId },
        orderBy: { order: 'asc' },
      });

      if (nextImage) {
        await tx.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return deletedImage;
  });
}

const ProductUpdateSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().min(10).optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().positive().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  inStock: z.boolean().optional(),
});

export async function updateProduct(id: string, data: z.infer<typeof ProductUpdateSchema>) {
  const validatedData = ProductUpdateSchema.parse(data);
  return prisma.product.update({
    where: { id },
    data: validatedData,
  });
}

export async function getFilteredProducts(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  orderBy?: string;
}) {
  const { category, minPrice, maxPrice, search, inStock, orderBy } = filters;

  const where: any = {};

  if (category) {
    where.category = {
      name: category
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (inStock) {
    where.inStock = true;
  }

  let orderByClause: any = { createdAt: 'desc' }; // Default ordering

  switch (orderBy) {
    case 'price_asc':
      orderByClause = { price: 'asc' };
      break;
    case 'price_desc':
      orderByClause = { price: 'desc' };
      break;
    case 'date_desc':
      orderByClause = { createdAt: 'desc' };
      break;
    case 'date_asc':
      orderByClause = { createdAt: 'asc' };
      break;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      category: true,
      ratings: true, // Make sure this is included
    },
    orderBy: orderByClause,
    take: 20, // Limit to 20 records
  });

  return products.map(product => ({
    ...product,
    averageRating: product.ratings && product.ratings.length > 0
      ? Number((product.ratings.reduce((sum, rating) => sum + rating.value, 0) / product.ratings.length).toFixed(1))
      : null,
  }));
}

export async function toggleFavorite(userId: string, productId: string) {
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { id: existingFavorite.id },
    });
    return { isFavorite: false };
  } else {
    await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });
    return { isFavorite: true };
  }
}

export async function getFavoriteProductIds(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
    },
    select: {
      productId: true,
    },
  });

  return favorites.map(favorite => favorite.productId);
}

export async function removeFavorite(userId: string, productId: string) {
  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { id: existingFavorite.id },
    });
    return { isFavorite: false };
  }
  
  //  else {
  //   await prisma.favorite.create({
  //     data: {
  //       userId,
  //       productId,
  //     },
  //   });
  //   return { isFavorite: true };
  // }
}

// Create Rating
export async function createRating(data: z.infer<typeof RatingSchema>) {
  const validatedData = RatingSchema.parse(data);
  return prisma.rating.create({
    data: validatedData,
  });
}

// Read Rating
export async function getRating(id: string) {
  return prisma.rating.findUnique({
    where: { id },
  });
}

// Read Ratings for a Product
export async function getProductRatings(productId: string) {
  return prisma.rating.findMany({
    where: { productId },
    include: { user: { select: { username: true } } },
  });
}

// Update Rating
export async function updateRating(id: string, data: Partial<z.infer<typeof RatingSchema>>) {
  const validatedData = RatingSchema.partial().parse(data);
  return prisma.rating.update({
    where: { id },
    data: validatedData,
  });
}

// Delete Rating
export async function deleteRating(id: string) {
  return prisma.rating.delete({
    where: { id },
  });
}

// Get Average Rating for a Product
export async function getAverageRating(productId: string) {
  const result = await prisma.rating.aggregate({
    where: { productId },
    _avg: { value: true },
    _count: { value: true },
  });

  return {
    averageRating: result._avg.value || 0,
    totalRatings: result._count.value,
  };
}

// Check if a user has already rated a product
export async function hasUserRatedProduct(userId: string, productId: string) {
  const rating = await prisma.rating.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return !!rating;
}

export async function getInboxMessages(userId: string) {
  return prisma.message.findMany({
    where: { receiverId: userId },
    include: {
      sender: {
        select: { username: true }
      },
      product: {
        select: {        title: true,
          id:true,
          images:true,
          price:true }
      }
    },
    orderBy: { sentAt: 'desc' }
  });
}

export async function getSentMessages(userId: string) {
  return prisma.message.findMany({
    where: { senderId: userId },
    include: {
      receiver: {
        select: { username: true }
      },
      product: {
        select: { 
          title: true,
          id:true,
          images:true,
          price:true

         }
      }
    },
    orderBy: { sentAt: 'desc' }
  });
}