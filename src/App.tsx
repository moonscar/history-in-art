import React, { useState, useMemo, useEffect } from 'react';
import { Artwork, TimeRange } from './types';
import { useArtworks } from './hooks/useArtworks';
import { parseURLParams, updateURL, getInitialStateFromURL } from './utils/urlParams';
import SEOHead from './components/SEOHead';
import { 
  generateWebsiteStructuredData, 
  generateCollectionStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData
} from './utils/structuredData';
import InteractiveWorldMap from './components/InteractiveWorldMap';
import Timeline from './components/Timeline';
import ArtworkModal from './components/ArtworkModal';
import ChatInterface from './components/ChatInterface';
import ResultsModal from './components/ResultsModal';
import { Globe, Clock, Palette, AlertCircle } from 'lucide-react';

function App() {
  const initialState = getInitialStateFromURL();
  const [timeRange, setTimeRange] = useState<TimeRange>(initialState.timeRange);
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
  }>(initialState.chatQuery);

  // Use the custom hook to fetch artworks from database
  const { 
    artworks: dbArtworks, 
    loading, 
    error, 
    getArtworksByLocation 
  } = useArtworks({
    timeRange,
    country: chatQuery.location,
    movement: chatQuery.movement,
    artist: chatQuery.artist
  });

  // Handle URL parameter changes and browser back/forward navigation
  useEffect(() => {
    const urlParams = parseURLParams();

    const hasURLParams = urlParams.location || urlParams.start || urlParams.end;

    if (hasURLParams && !loading && dbArtworks.length > 0 && !showResults) {
      if (urlParams.location) {
        const queryTimeRange = {
          start: urlParams.start || 1400,
          end: urlParams.end || 2024
        };
        handleLocationTimeUpdate(urlParams.location, queryTimeRange);
      }
    }
  }, [loading, dbArtworks, showResults]);

  // Update URL when filters change
  useEffect(() => {
    const urlParams = {
      location: chatQuery.location,
      start: timeRange.start !== 1400 ? timeRange.start : undefined,
      end: timeRange.end !== 2024 ? timeRange.end : undefined,
      artist: chatQuery.artist,
      movement: chatQuery.movement
    };
    
    // Only update URL if there are actual parameters to set
    const hasParams = Object.values(urlParams).some(value => value !== undefined);
    
    if (hasParams) {
      updateURL(urlParams, true); // Use replace to avoid cluttering browser history
    } else {
      // Clear URL parameters if no filters are active
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [timeRange, chatQuery]);

  const filteredArtworks = useMemo(() => {
    return dbArtworks.filter(artwork => {
      const withinTimeRange = artwork.year >= timeRange.start && artwork.year <= timeRange.end;
      const matchesLocation = !chatQuery.location || artwork.location.country === chatQuery.location;
      const matchesMovement = !chatQuery.movement || artwork.movement === chatQuery.movement;
      const matchesArtist = !chatQuery.artist || artwork.artist === chatQuery.artist;
      
      return withinTimeRange && matchesLocation && matchesMovement && matchesArtist;
    });
  }, [dbArtworks, timeRange, chatQuery]);

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

  const handleLocationTimeUpdate = (location: string, timeRange: TimeRange) => {
    // 更新时间轴
    setTimeRange(timeRange);
    
    // 更新查询参数
    setChatQuery(prev => ({
      ...prev,
      location,
      timeRange
    }));
    
    // 自动显示该地区的艺术品结果
    setTimeout(async () => {
      const locationArtworks = await getArtworksByLocation(location, timeRange);
      setResultsData({
        artworks: locationArtworks,
        location,
        timeRange
      });
      setShowResults(true);
    }, 500); // 给时间让筛选条件先更新
  };

  const handleLocationTimeSelect = async (location: string, currentTimeRange: TimeRange) => {
    try {
      const locationArtworks = await getArtworksByLocation(location, currentTimeRange);
      setResultsData({
        artworks: locationArtworks,
        location,
        timeRange: currentTimeRange
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching location artworks:', error);
    }
  };

  // Generate dynamic SEO data based on current state
  const generateDynamicSEO = () => {
    let title = "History-in-Art - 通过艺术品重新发现历史，探索时间与地理的交汇点";
    let description = "History-in-Art 是一款将 全球艺术作品 与 历史时空探索 融合的智能交互平台，旨在帮助用户在地理与时间的双重维度中发现、研究与欣赏艺术。通过 交互式世界地图 和 时间轴浏览，用户可以从古代文明到现代艺术，跨越数千年历史，探索各大洲、各国、各城市的绘画、雕塑与其他艺术形式。内置的 AI 艺术助手。内置的 AI 时空信息助手 精准聚焦于作品的年代背景与地域分布，让用户在地图与时间轴上高效开展时空艺术探索。History-in-Art 都能让您在沉浸式的可视化体验中了解作品的历史背景、创作故事与文化价值。适合艺术爱好者、历史学者、教育工作者以及希望通过艺术了解世界的人士，是一个兼具学习、研究与灵感发现的艺术导航平台。";
    let keywords = "艺术品,艺术导航,世界艺术,历史艺术,艺术地图,艺术时间轴,文艺复兴,巴洛克,印象派,现代艺术";
    let robots = "index, follow";

    if (chatQuery.location || chatQuery.movement || chatQuery.artist) {
      const filters = [];
      if (chatQuery.location) filters.push(chatQuery.location);
      if (chatQuery.movement) filters.push(chatQuery.movement);
      if (chatQuery.artist) filters.push(chatQuery.artist);
      
      title = `${filters.join(' ')} 艺术作品 | History in Art`;
      description = `探索${filters.join('、')}相关的艺术作品，发现${timeRange.start}-${timeRange.end}年间的艺术珍品。`;
      keywords = `${filters.join(',')},${keywords}`;
    } else if (timeRange.start !== 1400 || timeRange.end !== 2024) {
      title = `${timeRange.start}-${timeRange.end}年艺术作品 | History in Art`;
      description = `探索${timeRange.start}-${timeRange.end}年间的世界艺术作品，通过交互式地图和时间轴发现历史艺术珍品。`;
    }
    
    return { title, description, keywords, robots };
  };

  const { title, description, keywords, robots } = generateDynamicSEO();
  
  // Generate comprehensive structured data
  const websiteData = generateWebsiteStructuredData();
  const organizationData = generateOrganizationStructuredData();
  const collectionData = generateCollectionStructuredData(filteredArtworks, chatQuery.location, timeRange);
  
  // Generate breadcrumb data
  const breadcrumbItems = [
    { name: "首页", url: "https://history-in-art.org" }
  ];
  
  if (chatQuery.location) {
    breadcrumbItems.push({ 
      name: `${chatQuery.location}艺术品`, 
      url: `https://history-in-art.org?location=${encodeURIComponent(chatQuery.location)}` 
    });
  }
  
  if (timeRange.start !== 1400 || timeRange.end !== 2024) {
    breadcrumbItems.push({ 
      name: `${timeRange.start}-${timeRange.end}年`, 
      url: `https://history-in-art.org?start=${timeRange.start}&end=${timeRange.end}` 
    });
  }
  
  const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbItems);
  
  const allStructuredData = [websiteData, organizationData, collectionData, breadcrumbData];
  
  // Generate hreflang for international SEO (future preparation)
  const hreflangLinks = [
    { lang: "zh-CN", url: "https://history-in-art.org" },
    { lang: "en", url: "https://history-in-art.org/en" },
    { lang: "x-default", url: "https://history-in-art.org" }
  ];

  // Show loading state
  if (loading && dbArtworks.length === 0) {
    return (
      <>
        <SEOHead 
          title="加载中... | History in Art" 
          description="艺术品数据正在加载中，请稍候..." 
          keywords={keywords} 
          structuredData={websiteData}
          robots="noindex, nofollow"
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Loading Artworks</h2>
            <p className="text-gray-300">Fetching data from database...</p>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <SEOHead 
          title="数据库连接错误 | History in Art" 
          description="网站正在加载中，请稍后再试。" 
          keywords={keywords} 
          structuredData={websiteData}
          robots="noindex, nofollow"
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle size={64} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Database Connection Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400">
              Please make sure Supabase is properly configured. Click the "Connect to Supabase" button in the top right to set up your database connection.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title={title} 
        description={description} 
        keywords={keywords} 
        structuredData={allStructuredData}
        robots={robots}
        hreflang={hreflangLinks}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-gray-700" role="banner">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Palette size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">History in Art</h1>
                  <p className="text-gray-300 text-sm">Art as eyes, witness history</p>
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
                {loading && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-blue-400">Updating...</span>
                  </div>
                )}
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
        <main className="relative" role="main">
          {/* Full-screen Map */}
          <section className="h-[calc(100vh-80px)] relative" aria-label="Interactive World Map">
            <InteractiveWorldMap
              artworks={filteredArtworks}
              timeRange={timeRange}
              onLocationTimeSelect={handleLocationTimeSelect}
              onArtworkSelect={setSelectedArtwork}
            />
            
            {/* Floating Timeline */}
            <aside className="absolute bottom-6 left-6 right-6 z-20" aria-label="Historical Timeline">
              <Timeline
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </aside>
            
            {/* Floating Chat Interface */}
            <aside className="absolute top-6 right-6 z-20 w-80" aria-label="AI Assistant">
              <ChatInterface
                onQueryUpdate={handleChatQuery}
                onLocationTimeUpdate={handleLocationTimeUpdate}
              />
            </aside>
          </section>

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
        <footer className="mt-12 bg-black/20 backdrop-blur-sm border-t border-gray-700" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="mb-4" aria-label="Footer navigation">
              <ul className="flex flex-wrap justify-center space-x-6 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
                <li><a href="#" className="hover:text-white transition-colors">使用条款</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
                <li><a href="/sitemap.xml" className="hover:text-white transition-colors">网站地图</a></li>
              </ul>
            </nav>
            <div className="text-center text-gray-400 text-sm">
              <p>© 2025 History in Art. Rediscovering history through works of art by time and geography.</p>
              <p className="mt-2">通过艺术品重新发现历史，探索时间与地理的交汇点</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;