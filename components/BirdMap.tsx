"use client";

import React from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type BirdRecord = {
  id: number;
  japaneseName: string;
  photo: string;
  dateTaken: string;
  placeName: string;
  latitude: number;
  longitude: number;
  prefecture: string;
  country: string;
  individualType: string;
  memo: string;
  speciesGroupID: string;
};

type BirdMapProps = {
  mapCenter: [number, number];
  mapRecords: BirdRecord[];
  onSelectPhoto: (id: number) => void;
};

delete (L.Icon.Default.prototype as L.Icon.Default & {
  _getIconUrl?: unknown;
})._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  React.useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], 10);
    }
  }, [lat, lng, map]);

  return null;
}

export default function BirdMap({
  mapCenter,
  mapRecords,
  onSelectPhoto,
}: BirdMapProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <MapContainer center={mapCenter} zoom={10} scrollWheelZoom className="h-[420px] w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap lat={mapCenter[0]} lng={mapCenter[1]} />
        {mapRecords.map((record) => (
          <Marker
            key={record.id}
            position={[record.latitude, record.longitude]}
            eventHandlers={{
              click: () => {
                onSelectPhoto(record.id);
              },
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-sm">
                <p className="font-semibold">{record.japaneseName}</p>
                <p>撮影日: {record.dateTaken}</p>
                <p>場所: {record.placeName}</p>
                <p>区分: {record.individualType}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}