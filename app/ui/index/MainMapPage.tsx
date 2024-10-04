 
import { Product } from "~/db/definitions";
 
import { useMemo, useState } from 'react'

import DynamicMap from '~/ui/index/DynamicMap.client'
import SidebarProduct from '~/ui/index/sidebarProduct'
import { ClientOnly } from "remix-utils/client-only";


export default function MainMapPage({ Products }: { Products: Product[] }) {
  const [selectedProductId, handleProductClick] = useState("")

// const Map = useMemo(() => dynamic(
//     () => import('@/app/ui/index/DynamicMap'),
//     {
//         loading: () => <p>A map is loading</p>,
//         ssr: false }
// ), [])
//29.0586624, 31.1263232

const products : Product[] =[
  {
    title:"prod",
    address:"address",
    product_id:"65498776546",
    price:6546,
    latitude:29.0586624,
    longitude:31.1263232
  }
]

    return(
        <>

        
        {Array.isArray(Products) ? (
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
        {Products && (
            <ClientOnly
            fallback={
              <div
                
              />
            }
          >
            {() =>  <DynamicMap 
            products={products} 
             posix={[29.0586624, 31.1263232]}
            selectedProductId={selectedProductId} 
          />}
          </ClientOnly>
         
        )}
      </div>
      </>
    );
}