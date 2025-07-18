import React, { useState, useMemo } from 'react';
import { Artwork, TimeRange } from './types';
import { artworks } from './data/artworks';
import InteractiveWorldMap from './components/InteractiveWorldMap';
import Timeline from './components/Timeline';
import ArtworkModal from './components/ArtworkModal';
import ChatInterface from './components/ChatInterface';
import ResultsModal from './components/ResultsModal';
import { Globe, Clock, Palette } from 'lucide-react';

function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: 1400, end: 2024 });
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{
    artworks: Artwork[];
    location?: string;
    timeRange?: TimeRange;
  }>({ artworks: [] });
  const [chatQuery, setChatQuery] = useState<{
    timeRange?: TimeRange;
    location?: string;
    movement?: string;
    artist?: string;
  }>({});

  const filteredArtworks = useMemo(() => {
    return artworks.filter(artwork => {
      const withinTimeRange = artwork.year >= timeRange.start && artwork.year <= timeRange.end;
      const matchesLocation = !chatQuery.location || artwork.location.country === chatQuery.location;
      const matchesMovement = !chatQuery.movement || artwork.movement === chatQuery.movement;
      const matchesArtist = !chatQuery.artist || artwork.artist === chatQuery.artist;
      
      return withinTimeRange && matchesLocation && matchesMovement && matchesArtist;
    });
  }, [timeRange, chatQuery]);

  const handleChatQuery = (params: {
    timeRange?: TimeRange;
    location?: string;
    movement?: string;
    artist?: string;
  }) => {
    setChatQuery(params);
    if (params.timeRange) {
      setTimeRange(params.timeRange);
    }
  };

  const handleLocationTimeSelect = (location: string, currentTimeRange: TimeRange, locationArtworks: Artwork[]) => {
    setResultsData({
      artworks: locationArtworks,
      location,
      timeRange: currentTimeRange
    });
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ArtSpace Navigator</h1>
                <p className="text-gray-300 text-sm">Explore Art Through Time and Space</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-300">
              <div className="flex items-center">
                <Globe size={16} className="mr-1 text-blue-400" />
                {filteredArtworks.length} artworks found
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1 text-purple-400" />
                {timeRange.start} - {timeRange.end}
              </div>
              {chatQuery.location && (
                <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {chatQuery.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Full-screen Map */}
        <div className="h-[calc(100vh-80px)] relative">
          <InteractiveWorldMap
            artworks={filteredArtworks}
            timeRange={timeRange}
            onLocationTimeSelect={handleLocationTimeSelect}
            onArtworkSelect={setSelectedArtwork}
          />
          
          {/* Floating Timeline */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
            <Timeline
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
          </div>
          
          {/* Floating Chat Interface */}
          <div className="absolute top-6 right-6 z-20 w-80">
            <ChatInterface
              onQueryUpdate={handleChatQuery}
            />
          </div>
        </div>

        {/* Results Modal */}
        {showResults && (
          <ResultsModal
            artworks={resultsData.artworks}
            location={resultsData.location}
            timeRange={resultsData.timeRange}
            onClose={() => setShowResults(false)}
            onArtworkSelect={setSelectedArtwork}
          />
        )}

        {/* Artwork Detail Modal */}
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-black/20 backdrop-blur-sm border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 ArtSpace Navigator. Discover the world's greatest artworks through time and geography.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;