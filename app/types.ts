export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  category: {
    id: string;
    name: string;
  };
  images: {
    id: string;
    createdAt: Date;
    isPrimary: boolean;
    productId: string;
    imageUrl: string;
    order: number;
  }[];
  ratings: Array<{
    id: string;
    value: number;
    comment?: string;
    user: {
      username: string;
    };
  }>;
}