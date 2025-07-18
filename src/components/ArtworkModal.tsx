import React from 'react';
import { Artwork } from '../types';
import { X, MapPin, Calendar, User, Palette, Image } from 'lucide-react';

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
}

const ArtworkModal: React.FC<ArtworkModalProps> = ({ artwork, onClose }) => {
  if (!artwork) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">{artwork.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {artwork.period}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center text-gray-300 mb-2">
                  <Image size={16} className="mr-2 text-blue-400" />
                  <span className="font-medium">Medium</span>
                </div>
                <p className="text-white">{artwork.medium}</p>
              </div>
            </div>
            
            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <User size={16} className="mr-2 text-green-400" />
                  <span className="font-medium">Artist</span>
                </div>
                <p className="text-xl text-white font-semibold">{artwork.artist}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <Calendar size={16} className="mr-2 text-blue-400" />
                  <span className="font-medium">Year Created</span>
                </div>
                <p className="text-lg text-white">{artwork.year}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <MapPin size={16} className="mr-2 text-purple-400" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="text-lg text-white">{artwork.location.city}, {artwork.location.country}</p>
              </div>
              
              <div>
                <div className="flex items-center text-gray-300 mb-2">
                  <Palette size={16} className="mr-2 text-yellow-400" />
                  <span className="font-medium">Art Movement</span>
                </div>
                <p className="text-lg text-white">{artwork.movement}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{artwork.description}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                  View in Virtual Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkModal;