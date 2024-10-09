import { useSearchParams } from '@remix-run/react';
import DynamicMap from '~/ui/index/DynamicMap.client'
import SidebarProduct from '~/ui/index/sidebarProduct'
import { ClientOnly } from "remix-utils/client-only";
import { Product } from "~/db/definitions";
import { ScrollArea } from "~/components/ui/scroll-area"

interface MainMapPageProps {
  products: Product[];
  categories: { id: string; name: string }[];
  selectedProduct: Product | null;
  favoriteProductIds: string[];
  user: any; // Add this line
}

export default function MainMapPage({ products, categories, selectedProduct, favoriteProductIds, user }: MainMapPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProductId = searchParams.get('selectedProductId') || '';

  const handleProductClick = (productId: string) => {
    setSearchParams({ selectedProductId: productId });
  };

  return(
    <div className="flex h-screen">
      <ScrollArea className="min-w-96">
        <SidebarProduct 
          Products={products} 
          categories={categories}
          onClick={handleProductClick}
          selectedProductId={selectedProductId}
          favoriteProductIds={favoriteProductIds} // Add this line
        />
      </ScrollArea>

      {/* Map container */}
      <div className="flex-1 z-0">
        <ClientOnly fallback={<div>Loading map...</div>}>
          {() => (
            <DynamicMap 
              products={products} 
              posix={[29.0586624, 31.1263232]}
              selectedProductId={selectedProductId} 
              favoriteProductIds={favoriteProductIds} // Add this line
              user={user} // Add this line
            />
          )}
        </ClientOnly>
      </div>
    </div>
  );
}