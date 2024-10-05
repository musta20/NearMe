import { useState } from 'react'
import DynamicMap from '~/ui/index/DynamicMap.client'
import SidebarProduct from '~/ui/index/sidebarProduct'
import { ClientOnly } from "remix-utils/client-only";
import { Product } from "~/db/definitions";

export default function MainMapPage({ products }: { products: Product[] }) {
  const [selectedProductId, setSelectedProductId] = useState("")

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
  };

  return(
    <>
      {products.length > 0 ? (
        <SidebarProduct 
          Products={products} 
          onClick={handleProductClick}
          selectedProductId={selectedProductId}
        />
      ) : (
        <p>No products available</p>
      )}

      {/* Map container */}
      <div className="flex-1 z-0 bg-gray-200">
        {products.length > 0 && (
          <ClientOnly
            fallback={
              <div>Loading map...</div>
            }
          >
            {() => (
              <DynamicMap 
                products={products} 
                posix={[29.0586624, 31.1263232]}
                selectedProductId={selectedProductId} 
              />
            )}
          </ClientOnly>
        )}
      </div>
    </>
  );
}