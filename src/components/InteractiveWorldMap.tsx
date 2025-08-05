import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Artwork, TimeRange } from '../types';
import { MapPin, Image as ImageIcon, Calendar, User, BarChart3 } from 'lucide-react';
import { ArtworkService } from '../services/artworkService';
import worldCountries from '../data/world-countries.json';
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
  try {
    const clickPoint = turf.point([lng, lat]);
    
    // 在 worldCountries 数据中查找包含该点的国家
    for (const feature of worldCountries.features) {
      if (turf.booleanPointInPolygon(clickPoint, feature)) {
        return feature.properties.NAME || feature.properties.name || 'Unknown';
      }
    }
    
    return 'Unknown Location';
  } catch (error) {
    console.error('Error in coordinate detection:', error);
    return 'Unknown Location';
  }
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
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [countryCounts, setCountryCounts] = useState<{ [country: string]: number }>({});
  const [clickedLocation, setClickedLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
    country: string;
  } | null>(null);

  // Fetch country counts when component mounts or time range changes
  useEffect(() => {
    const fetchCountryCounts = async () => {
      const rawCounts = await ArtworkService.getArtworkCountsByCountry({ timeRange });

      // 获取GeoJSON中的有效国家名
      const validCountries = new Set(
       worldCountries.features.map(f => f.properties.name).filter(Boolean)
      );

      // 只保留匹配的国家
      const filteredCounts = Object.fromEntries(
       Object.entries(rawCounts).filter(([location]) => validCountries.has(location))
      );

      console.log("原始记录", rawCounts);
      console.log("显示记录", filteredCounts);

      setCountryCounts(filteredCounts);
    };

    fetchCountryCounts();
  }, [timeRange]);

  // Get color based on artwork count
  const getHeatmapColor = (count: number): string => {
    if (count <= 10) return '#374151'; // Gray for no artworks
    if (count <= 100) return '#3B82F6'; // Blue for 1 artwork
    if (count <= 200) return '#10B981'; // Green for 2 artworks
    if (count <= 300) return '#F59E0B'; // Yellow for 3 artworks
    if (count >= 300) return '#EF4444'; // Red for 4+ artworks
    return '#374151';
  };

  // Get max count for legend
  const maxCount = Math.max(...Object.values(countryCounts), 0);

  // Style function for GeoJSON countries
  const countryStyle = (feature: any) => {
    const countryName = feature.properties.name;
    const count = countryCounts[countryName] || 0;
    
    return {
      fillColor: getHeatmapColor(count),
      weight: 1,
      opacity: 0.8,
      color: '#1F2937',
      fillOpacity: showHeatmap ? 0.7 : 0.1
    };
  };

  // Handle country click
  const onCountryClick = (feature: any, layer: any) => {
    const countryName = feature.properties.NAME;
    const count = countryCounts[countryName] || 0;
    
    if (count > 0) {
      onLocationTimeSelect(countryName, timeRange);
    }
    
    // Show popup with country info
    const popup = L.popup()
      .setContent(`
        <div class="bg-gray-800 text-white p-3 rounded-lg">
          <h3 class="font-bold text-blue-400 mb-2">${countryName}</h3>
          <p class="text-gray-300 text-sm mb-2">${count} artwork${count !== 1 ? 's' : ''}</p>
          ${count > 0 ? '<button onclick="window.queryCountry(\'' + countryName + '\')" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm">查看艺术品</button>' : '<p class="text-gray-500 text-xs">该时期无艺术品</p>'}
        </div>
      `);
    
    layer.bindPopup(popup);
  };

  // Add global function for popup button
  useEffect(() => {
    (window as any).queryCountry = (countryName: string) => {
      onLocationTimeSelect(countryName, timeRange);
    };
    
    return () => {
      delete (window as any).queryCountry;
    };
  }, [onLocationTimeSelect, timeRange]);

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
        <div className="flex items-center justify-between mb-3">
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
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-lg transition-colors ${
              showHeatmap 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={showHeatmap ? '隐藏热力图' : '显示热力图'}
          >
            <BarChart3 size={16} />
          </button>
        </div>
        
        {showHeatmap && (
          <div className="border-t border-gray-600 pt-3">
            <div className="text-xs text-gray-400 mb-2">热力图 - 艺术品数量</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center text-gray-300">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#374151' }}></div>
                0 件
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#3B82F6' }}></div>
                1 件
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#10B981' }}></div>
                2 件
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#F59E0B' }}></div>
                3 件
              </div>
              <div className="flex items-center text-gray-300">
                <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: '#EF4444' }}></div>
                4+ 件
              </div>
              {maxCount > 0 && (
                <div className="text-gray-400 text-xs">
                  最多: {maxCount} 件
                </div>
              )}
            </div>
          </div>
        )}
        
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
          
          {/* Country Heatmap Layer */}
          <GeoJSON
            data={worldCountries as any}
            style={countryStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: () => onCountryClick(feature, layer),
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle(countryStyle(feature));
                }
              });
            }}
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
          
          {/* Individual Artwork Markers - only show when zoomed in or heatmap is off */}
          {(!showHeatmap || Object.keys(artworksByLocation).length < 20) && 
            Object.entries(artworksByLocation).map(([locationKey, locationArtworks]) => {
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
            })
          }
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

      {/* Updated Map Legend */}
      <div className="absolute bottom-6 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-xl p-4 shadow-2xl">
        <h3 className="text-white font-medium mb-3 text-sm">
          {showHeatmap ? '国家热力图' : '艺术时期'}
        </h3>
        
        {showHeatmap ? (
          <div className="space-y-2 text-xs">
            <div className="text-gray-400 mb-2">根据艺术品数量着色</div>
            {[
              { count: '0', color: '#374151', label: '无艺术品' },
              { count: '1', color: '#3B82F6', label: '1件艺术品' },
              { count: '2', color: '#10B981', label: '2件艺术品' },
              { count: '3', color: '#F59E0B', label: '3件艺术品' },
              { count: '4+', color: '#EF4444', label: '4件以上' }
            ].map(({ count, color, label }) => (
              <div key={count} className="flex items-center text-gray-300">
                <div
                  className="w-4 h-3 mr-2 border border-gray-600"
                  style={{ backgroundColor: color }}
                ></div>
                {label}
              </div>
            ))}
          </div>
        ) : (
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
        )}
        
        <div className="mt-3 text-xs text-gray-400 border-t border-gray-600 pt-2">
          {showHeatmap ? '点击国家查看艺术品' : '点击地图显示城市 • 点击城市名查询艺术品'}
        </div>
      </div>
    </div>
  );
};

export default InteractiveWorldMap;