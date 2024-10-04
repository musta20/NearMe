 
import { MapPin , Map , DollarSign} from "lucide-react";
import { Product } from "~/db/definitions"
import { calculateDistance } from "~/utils/distance";
import { useState, useEffect } from 'react';
import { Button } from "~/components/ui/button"
import FilterDialog from "~/ui/index/filterDialog";

interface SidebarProductProps {
  Products: Product[]
  onClick: (productId: string) => void
  selectedProductId: string | null
}

export default function SidebarProduct({ Products, onClick, selectedProductId }: SidebarProductProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.log('Geolocation is not available');
    }
  }, []);

  return (
  <div className="w-96 bg-white shadow-lg  flex flex-col ">
    <div className="p-4 border-b">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
          Electronics
        </Button>
        <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
          Clothing
        </Button>
        <Button variant="outline" size="sm" className="rounded-full whitespace-nowrap">
          Food
        </Button>
        <FilterDialog />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Products.map((item: Product) => {
        const distance = userLocation && item.latitude && item.longitude
          ? calculateDistance(userLocation[0], userLocation[1], item.latitude, item.longitude)
          : null;

        const isSelected = item.product_id === selectedProductId;

        return (
          <div 
            key={item.product_id} 
            className={`bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'border-blue-500 shadow-md' : ''}`}
            onClick={() => onClick(item.product_id)}
          >
            <div className="flex items-start">
              {item.primary_image_url && (
                <img src={item.primary_image_url} alt={`Product ${item.title}`} className="w-20 h-20 rounded-lg object-cover mr-4" />
              )}
              <div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">High-quality product description</p>
                <div className="flex items-center text-sm text-blue-900">
                  <DollarSign size={16} className="mr-1" />
                  <span>{item.price}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={16} className="mr-1" />
                  <span>{item.address}</span>
                </div>
                {distance !== null && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Map size={16} className="mr-1" />
                    <span>{distance} miles away</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}