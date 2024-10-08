 
 
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPin, CircleDollarSign, Heart } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect, useState, useRef } from "react";
import L from 'leaflet';
import { Button } from "~/components/ui/button";
import { useFetcher } from "@remix-run/react";

 
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface DynamicMapProps {
  products: any,
  posix: [number,number]
  selectedProductId: string | null
}

export default function DynamicMap({ products, posix, selectedProductId }: DynamicMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)
  const [center, setCenter] = useState(posix);
  const [zoom, setZoom] = useState(18);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const fetcher = useFetcher();

  useEffect(() => {
      if (selectedProductId) {
          const product = products.find((item :any) => item.id === selectedProductId);
          if (product) {
              setZoom(15);
              setCenter([product.latitude, product.longitude]);
              
              // Open the popup for the selected product
              const marker = markerRefs.current[selectedProductId];
              if (marker) {
                  marker.openPopup();
              }
          }
      }
  }, [selectedProductId, products]);

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

  const handleFavoriteClick = (productId: string) => {
    fetcher.submit(
      { productId },
      { method: "post", action: "/api/toggle-favorite" }
    );
  };

  if (!position) {
    return <p>Loading map...</p>
  }

  return (<MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
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
                >
                    <Popup className="p-1" minWidth={680}>
                        <div className="flex flex-col items-center p-1">
                            {product?.images[0]?.imageUrl && (
                                <img src={product?.images[0]?.imageUrl} alt={`Product ${product.title}`} className="w-full min-h-[10rem] max-h-[15rem] rounded-lg object-cover mr-4" />
                            )}
                            <div className="p-3 w-full my-2 rounded-md  ">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-lg">{product.title}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFavoriteClick(product.id)}
                                    >
                                        <Heart className={`h-5 w-5 ${product.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                                    </Button>
                                </div>
                                <p className="text-md" >{product.description}</p>
                                <div className="flex gap-3">

                                <div className="flex items-center text-lg text-yellow-950">
                                        <CircleDollarSign size={18} className="mr-1" />
                                        <span>price: {product.price}</span>
                                    </div>
                                
                                    <div className="flex items-center text-lg text-gray-500">
                                        <MapPin size={16} className="mr-1" />
                                        <span>{product.address}</span>
                                    </div>
                               
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
  )
}