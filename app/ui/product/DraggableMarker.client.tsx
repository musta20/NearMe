 
 
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { useState, useRef, useMemo } from "react";

 
// function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
//   const map = useMap();
//   map.setView(center, zoom);
//   return null;
// }



export default function DynamicMap({productPostion , setPosition}) {
   const [zoom, setZoom] = useState(18);
 
  

  if (!productPostion) {
    return <p>Loading map...</p>
  }

  return (<MapContainer
            center={productPostion}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            {/* <ChangeView center={productPostion} zoom={zoom} /> */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
      <DraggableMarker setPosition ={setPosition} center={productPostion} />
        </MapContainer>
  )
}

function DraggableMarker({center , setPosition}) {
  const startp = center
   const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          let _newpostion = marker.getLatLng();
           setPosition([_newpostion.lat,_newpostion.lng])
        }
      },
    }),
    [],
  )
 
  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={startp}
      ref={markerRef}>
 
    </Marker>
  )
}