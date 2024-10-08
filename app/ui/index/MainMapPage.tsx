import { useState } from 'react'
import DynamicMap from '~/ui/index/DynamicMap.client'
import SidebarProduct from '~/ui/index/sidebarProduct'
import { ClientOnly } from "remix-utils/client-only";
import { Product } from "~/db/definitions";
import { ScrollArea } from "~/components/ui/scroll-area"

export default function MainMapPage({ products, categories }: { products: Product[], categories: any[] }) {
  const [selectedProductId, setSelectedProductId] = useState("")

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
  };

  return(
    <div className="flex h-screen">
      <ScrollArea className="min-w-96    ">
        
          <SidebarProduct 
            Products={products} 
            categories={categories}
            onClick={handleProductClick}
            selectedProductId={selectedProductId}
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
            />
          )}
        </ClientOnly>
      </div>
    </div>
  );
}