import React from 'react';
import { Artwork } from '../types';
import { MapPin, Calendar, User, Palette } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: () => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onClick }) => {
  return (
    <div 
      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={artwork.imageUrl} 
          alt={artwork.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {artwork.period}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
            {artwork.title}
          </h3>
          <div className="flex items-center text-gray-400 text-sm mt-1">
            <User size={14} className="mr-1" />
            {artwork.artist}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-300">
            <Calendar size={14} className="mr-2 text-blue-400" />
            {artwork.year}
          </div>
          
          <div className="flex items-center text-gray-300">
            <MapPin size={14} className="mr-2 text-green-400" />
            {artwork.location.city}, {artwork.location.country}
          </div>
          
          <div className="flex items-center text-gray-300">
            <Palette size={14} className="mr-2 text-purple-400" />
            {artwork.movement}
          </div>
        </div>
        
        <p className="text-gray-400 text-xs line-clamp-2">
          {artwork.description}
        </p>
      </div>
    </div>
  );
};

export default ArtworkCard;