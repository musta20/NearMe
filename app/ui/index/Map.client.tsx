 
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Product } from '~/db/definitions'
import { MapPin, CircleDollarSign } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useEffect, useState, useRef } from "react";
import L from 'leaflet';

interface MapProps {
    posix: [number, number];
    products: Product[];
    selectedProductId: string | null;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Map({ posix, products, selectedProductId }: MapProps) {
    const [center, setCenter] = useState(posix);
    const [zoom, setZoom] = useState(18);
    const markerRefs = useRef<{ [key: string]: L.Marker }>({});

    useEffect(() => {
        if (selectedProductId) {
            const product = products.find(item => item.product_id === selectedProductId);
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

    return (
        <MapContainer
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
            {products.map((product) => (
                <Marker 
                    key={product.product_id} 
                    position={[product.latitude, product.longitude]}

                    ref={(ref) => {
                        if (ref) {
                            markerRefs.current[product.product_id] = ref;
                        }
                    }}
                >
                    <Popup minWidth={380}>
                        <div className="flex flex-col items-center p-1">
                            {product.primary_image_url && (
                                <img src={product.primary_image_url} alt={`Product ${product.title}`} className="w-full min-h-[10rem] max-h-[10rem] rounded-lg object-cover mr-4" />
                            )}
                            <div className="p-3 w-full my-2 rounded-md border">
                                <span className="font-semibold text-lg">{product.title}</span>
                                <div className="flex gap-3">

                                <div className="flex items-center text-md text-yellow-950">
                                        <CircleDollarSign size={18} className="mr-1" />
                                        <span>price: {product.price}</span>
                                    </div>

                                    <div className="flex items-center text-md text-gray-500">
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