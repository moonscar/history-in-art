import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Artwork, TimeRange } from '../types';
import { MapPin, Image as ImageIcon, Calendar, User } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveWorldMapProps {
  artworks: Artwork[];
  timeRange: TimeRange;
  onLocationTimeSelect: (location: string, timeRange: TimeRange) => void;
  onArtworkSelect: (artwork: Artwork) => void;
}

// Custom marker icons for different periods
const createCustomIcon = (period: string) => {
  const colors: { [key: string]: string } = {
    'Ancient': '#8B5A2B',
    'Medieval': '#4A5568',
    'Renaissance': '#D69E2E',
    'Baroque': '#C53030',
    'Neoclassical': '#3182CE',
    'Impressionism': '#38A169',
    'Post-Impressionism': '#38A169',
    'Modern': '#805AD5',
    'Contemporary': '#E53E3E',
    'Surrealism': '#805AD5',
    'Edo Period': '#2D3748'
  };

  const color = colors[period] || '#6366F1';
  
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// City location marker
const createCityMarker = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 12px;
        height: 12px;
        background: #3B82F6;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    className: 'city-marker',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6]
  });
};

// Component to handle map click events
const MapClickHandler: React.FC<{
  onLocationClick: (lat: number, lng: number) => void;
}> = ({ onLocationClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationClick(lat, lng);
    }
  });
  return null;
};

// Component to get country name from coordinates (simplified)
const getCountryFromCoordinates = (lat: number, lng: number): string => {
  // Simplified country detection based on coordinates
  // In a real application, you would use a reverse geocoding service
  if (lat >= 35 && lat <= 47 && lng >= 6 && lng <= 19) return 'Italy';
  if (lat >= 42 && lat <= 51 && lng >= -5 && lng <= 8) return 'France';
  if (lat >= 36 && lat <= 44 && lng >= -10 && lng <= 4) return 'Spain';
  if (lat >= 50 && lat <= 54 && lng >= 3 && lng <= 7) return 'Netherlands';
  if (lat >= 30 && lat <= 46 && lng >= 129 && lng <= 146) return 'Japan';
  if (lat >= 25 && lat <= 49 && lng >= -125 && lng <= -66) return 'United States';
  
  return 'Unknown Location';
};

// Get city name from coordinates
const getCityFromCoordinates = (lat: number, lng: number): string => {
  // Simplified city detection based on coordinates
  if (lat >= 43.7 && lat <= 43.8 && lng >= 11.2 && lng <= 11.3) return 'Florence';
  if (lat >= 43.7 && lat <= 43.8 && lng >= 4.8 && lng <= 4.9) return 'Saint-Rémy-de-Provence';
  if (lat >= 40.4 && lat <= 40.5 && lng >= -3.8 && lng <= -3.6) return 'Madrid';
  if (lat >= 52.0 && lat <= 52.1 && lng >= 4.3 && lng <= 4.4) return 'Delft';
  if (lat >= 35.6 && lat <= 35.7 && lng >= 139.6 && lng <= 139.8) return 'Tokyo';
  if (lat >= 40.9 && lat <= 41.0 && lng >= -92.3 && lng <= -92.1) return 'Eldon';
  if (lat >= 42.2 && lat <= 42.3 && lng >= 2.9 && lng <= 3.0) return 'Figueres';
  
  // Fallback to country-based city mapping
  const country = getCountryFromCoordinates(lat, lng);
  const cityMap: { [key: string]: string } = {
    'Italy': 'Florence',
    'France': 'Paris',
    'Spain': 'Madrid',
    'Netherlands': 'Amsterdam',
    'Japan': 'Tokyo',
    'United States': 'New York'
  };
  
  return cityMap[country] || 'Unknown City';
};

const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  artworks,
  timeRange,
  onLocationTimeSelect,
  onArtworkSelect
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
    country: string;
  } | null>(null);

  // Group artworks by location to create clusters
  const artworksByLocation = artworks.reduce((acc, artwork) => {
    const key = `${artwork.location.coordinates[0]},${artwork.location.coordinates[1]}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(artwork);
    return acc;
  }, {} as { [key: string]: Artwork[] });

  const handleLocationClick = (locationArtworks: Artwork[]) => {
    const location = locationArtworks[0].location.country;
    onLocationTimeSelect(location, timeRange);
  };

  const handleMapClick = (lat: number, lng: number) => {
    const country = getCountryFromCoordinates(lat, lng);
    const city = getCityFromCoordinates(lat, lng);
    
    setClickedLocation({
      lat,
      lng,
      city,
      country
    });
  };

  const handleCityClick = () => {
    if (!clickedLocation) return;
    
    // Filter artworks by the clicked location and current time range
    const locationArtworks = artworks.filter(artwork => 
      artwork.location.country === clickedLocation.country &&
      artwork.year >= timeRange.start && 
      artwork.year <= timeRange.end
    );
    
    if (locationArtworks.length > 0) {
      onLocationTimeSelect(clickedLocation.country, timeRange);
    } else {
      // Show a message if no artworks found for this location/time combination
      alert(`在 ${clickedLocation.city}, ${clickedLocation.country} (${timeRange.start}-${timeRange.end}) 未找到艺术品`);
    }
    
    // Clear the clicked location after query
    setClickedLocation(null);
  };

  return (
    <div className="absolute inset-0">
      {/* Map Info Panel */}
      <div className="absolute top-6 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-white">
            <MapPin size={16} className="mr-2 text-blue-400" />
            <span className="font-medium">{Object.keys(artworksByLocation).length} locations</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Calendar size={16} className="mr-1 text-purple-400" />
            {timeRange.start} - {timeRange.end}
          </div>
        </div>
        {clickedLocation && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-1">点击的位置:</div>
            <div className="text-sm text-blue-400">{clickedLocation.city}, {clickedLocation.country}</div>
          </div>
        )}
      </div>

      <div className="absolute inset-0">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-10"
          whenReady={() => setMapLoaded(true)}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <MapClickHandler onLocationClick={handleMapClick} />
          
          {/* Clicked location marker */}
          {clickedLocation && (
            <Marker
              position={[clickedLocation.lat, clickedLocation.lng]}
              icon={createCityMarker()}
            >
              <Popup className="custom-popup" maxWidth={200}>
                <div className="bg-gray-800 text-white p-3 rounded-lg">
                  <h3 className="font-bold text-blue-400 mb-2">
                    {clickedLocation.city}
                  </h3>
                  <p className="text-gray-300 text-sm mb-3">
                    {clickedLocation.country}
                  </p>
                  <button
                    onClick={handleCityClick}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    查询该地区艺术品
                  </button>
                </div>
              </Popup>
            </Marker>
          )}
          
          {Object.entries(artworksByLocation).map(([locationKey, locationArtworks]) => {
            const [lng, lat] = locationKey.split(',').map(Number);
            const primaryArtwork = locationArtworks[0];
            
            return (
              <Marker
                key={locationKey}
                position={[lat, lng]}
                icon={createCustomIcon(primaryArtwork.period)}
              >
                <Popup className="custom-popup" maxWidth={300}>
                  <div className="bg-gray-800 text-white p-4 rounded-lg min-w-[280px]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-blue-400">
                        {primaryArtwork.location.city}, {primaryArtwork.location.country}
                      </h3>
                      <span className="bg-purple-600 text-xs px-2 py-1 rounded-full">
                        {locationArtworks.length} artwork{locationArtworks.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {locationArtworks.map((artwork) => (
                        <div
                          key={artwork.id}
                          className="flex items-start space-x-3 p-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => onArtworkSelect(artwork)}
                        >
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm truncate">
                              {artwork.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-300 mt-1">
                              <User size={10} className="mr-1" />
                              {artwork.artist}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Calendar size={10} className="mr-1" />
                              {artwork.year} • {artwork.period}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleLocationClick(locationArtworks)}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      查看该地区艺术品 ({locationArtworks.length})
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading world map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        <h3 className="text-white font-medium mb-3 text-sm">Art Periods</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { period: 'Renaissance', color: '#D69E2E' },
            { period: 'Baroque', color: '#C53030' },
            { period: 'Modern', color: '#805AD5' },
            { period: 'Contemporary', color: '#E53E3E' }
          ].map(({ period, color }) => (
            <div key={period} className="flex items-center text-gray-300">
              <div
                className="w-3 h-3 rounded-full mr-2 border border-white"
                style={{ backgroundColor: color }}
              ></div>
              {period}
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-400 border-t border-gray-600 pt-2">
          点击地图显示城市 • 点击城市名查询艺术品
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;