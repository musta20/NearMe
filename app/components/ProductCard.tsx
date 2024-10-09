import React from 'react';
import { Link } from '@remix-run/react';
import { Card, CardContent } from '~/components/ui/card';
import { DollarSign } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, price, imageUrl }) => {
  return (
    <Link to={`/?selectedProductId=${id}`} className="block max-w-[10rem] ">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="aspect-w-16 aspect-h-9">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="object-cover w-full h-full max-h-[5rem]" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                No Image
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>{price}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ProductCard;