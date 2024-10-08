import { MapPin, Map, DollarSign, PackageX } from "lucide-react";
import { calculateDistance } from "~/utils/distance";
import { useState, useEffect } from 'react';
import { Button } from "~/components/ui/button"
import FilterDialog from "~/ui/index/filterDialog";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"

interface SidebarProductProps {
  Products: any
  categories:any
  onClick: (productId: string) => void
  selectedProductId: string | null
}

export default function SidebarProduct({ Products, categories, onClick, selectedProductId }: SidebarProductProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const handleCategoryClick = (categoryName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("category", categoryName);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="w-96 bg-white shadow-lg flex flex-col ">
      <ScrollArea className="p-4 border-b">
        <div className="flex space-x-2   pb-2">
          <FilterDialog />
          {categories.map((cat: any) => (
            <Button
              key={cat.id}
              variant="outline"
              size="sm"
              className="rounded-full whitespace-nowrap"
              onClick={() => handleCategoryClick(cat.name)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />

      </ScrollArea>
      {Products?.length ? 
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Products.map((item: any) => {
          const distance = userLocation && item.latitude && item.longitude
            ? calculateDistance(userLocation[0], userLocation[1], item.latitude, item.longitude)
            : null;

          const isSelected = item.id === selectedProductId;

          return (
            <div 
              key={item.id} 
              className={`bg-white p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'border-blue-500 shadow-md' : ''}`}
              onClick={() => onClick(item.id)}
            >
              <div className="flex items-start">
                {item?.images[0]?.imageUrl && (
                  <img src={item?.images[0]?.imageUrl} alt={`Product ${item.title}`} className="w-20 h-20 rounded-lg object-cover mr-4" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {/* <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p> */}
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
      : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <PackageX size={64} className="text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
}