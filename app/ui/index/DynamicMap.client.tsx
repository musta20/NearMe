import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, CircleDollarSign, Heart, Star, MessageCircle, Mail, X } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect, useState, useRef } from "react";
import L from 'leaflet';
import { Button } from "~/components/ui/button";
import { useFetcher, useNavigate } from "@remix-run/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import { SendMessageForm } from '~/components/SendMessageForm';

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface DynamicMapProps {
  products: any,
  posix: [number,number]
  selectedProductId: string | null
  favoriteProductIds: string[] // Add this line
  user: any // Add this line
}

export default function DynamicMap({ products, posix, selectedProductId, favoriteProductIds, user }: DynamicMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [center, setCenter] = useState(posix);
  const [zoom, setZoom] = useState(18);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMessageFormOpen, setIsMessageFormOpen] = useState(false);
  const [selectedProductForMessage, setSelectedProductForMessage] = useState(null);

  useEffect(() => {
    if (isMapReady && selectedProductId) {
      const product = products.find((item :any) => item.id === selectedProductId);
      if (product) {
        setZoom(15);
        setCenter([product.latitude, product.longitude]);
        
        // Open the popup for the selected product
        const marker = markerRefs.current[selectedProductId];
        if (marker) {
          mapRef.current?.setView(marker.getLatLng(), 15);
          marker.openPopup();
        }
      }
    }
  }, [isMapReady, selectedProductId, products]);

  useEffect(() => {
     if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
           setPosition([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Error getting location:', error)
          // Fallback to a default location if there's an error
          setPosition([29.0586624, 31.1263232])
        }
      )
    } else {
       // Fallback to a default location if geolocation is not available
      setPosition([29.0586624, 31.1263232])
    }
  }, [])

  const handleFavoriteToggle = (productId: string) => {
    const isFavorite = favoriteProductIds.includes(productId);
    fetcher.submit(
      { productId },
      { 
        method: "post", 
        action: isFavorite ? "/api/unfavorite" : "/api/toggle-favorite"
      }
    );
  };

  const handleProductClick = (productId: string) => {
    navigate(`/?selectedProductId=${productId}`, { replace: true });
  };

  const handleContactSeller = (productId: string) => {
    navigate(`/send-message/${productId}`);
  };

  const handleClosePopup = (marker: L.Marker) => {
    marker.closePopup();
  };

  if (!position) {
    return <p>Loading map...</p>
  }

  return (<MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        ref={(map) => {
          mapRef.current = map;
          if (map) {
            setIsMapReady(true);
          }
        }}
      >
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {products.map((product :any) => (
          <Marker 
            key={product.id} 
            position={[product.latitude, product.longitude]}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[product.id] = ref;
              }
            }}
            eventHandlers={{
              click: () => handleProductClick(product.id)
            }}
          >
            <Popup className="p-1" closeButton={false} minWidth={680}>
            <button 
                  className="absolute -top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => handleClosePopup(markerRefs.current[product.id])}
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              <div className="relative flex flex-col items-center ">
        
                <Carousel>
                  <CarouselContent>

                    {product.images && product.images.length > 0 && (
                      product?.images.map((img:any)=>(<CarouselItem                           key={img.id}
>
                        <img 
                          src={img.imageUrl} 
                          alt={`Product ${product.title}`} 
                          className="w-full min-h-[10rem] max-h-[15rem] rounded-lg object-cover mr-4" 
                        />
                    </CarouselItem>))
    


                    )}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
             
              <div className="p-3 w-full my-2 border rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">{product.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(product.id);
                    }}
                  >
                    <Heart className={`h-5 w-5 ${favoriteProductIds.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </Button>
                </div>
               <div className="flex justify-between my-2"> <p className="text-md w-1/2" >{product.description}</p>
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleContactSeller(product.id)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                )}</div>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center text-lg text-yellow-950">
                    <CircleDollarSign size={18} className="mr-1" />
                    <span>price: {product.price}</span>
                  </div>
                  <div className="flex items-center text-lg text-gray-500">
                    <MapPin size={16} className="mr-1" />
                    <span>{product.address}</span>
                  </div>
                  {product.averageRating !== null && (
                    <div className="flex items-center text-lg text-yellow-600">
                      <Star size={16} fill="yellow" className="mr-1" />
                      <span>{product.averageRating?.toFixed(1)}</span>
                    </div>
                  )}
                  
                </div>
                {/* Add Ratings and Comments Section */}
                {product.ratings && product.ratings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg mb-2">Ratings and Comments</h4>
                    {product.ratings.map((rating: any) => (
                      <div key={rating.id} className="mb-2 p-2 bg-gray-100 rounded">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{rating?.user?.username}</span>
                          <div className="flex items-center text-yellow-600">
                            <Star size={14} fill="yellow" className="mr-1" />
                            <span>{rating.rating}</span>
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-sm mt-1">
                            <MessageCircle size={14} className="inline mr-1" />
                            {rating.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                

              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      {selectedProductForMessage && (
        <SendMessageForm
          product={selectedProductForMessage}
          isOpen={isMessageFormOpen}
          onClose={() => setIsMessageFormOpen(false)}
        />
      )}
    </MapContainer>
  )
}