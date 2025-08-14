import { Artwork } from '../types';

// Generate structured data for the website
export const generateWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ArtSpace Navigator",
  "description": "探索世界各地的艺术珍品，通过时空维度智能导航系统，结合AI助手、交互式地图和时间轴，发现不同历史时期的艺术作品。",
  "url": "https://artspace-navigator.vercel.app",
  "inLanguage": "zh-CN",
  "copyrightYear": "2025",
  "copyrightHolder": {
    "@type": "Organization",
    "name": "ArtSpace Navigator"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://artspace-navigator.vercel.app?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "author": {
    "@type": "Organization",
    "name": "ArtSpace Navigator",
    "url": "https://artspace-navigator.vercel.app"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ArtSpace Navigator",
    "url": "https://artspace-navigator.vercel.app"
  }
});

// Generate organization structured data
export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ArtSpace Navigator",
  "url": "https://artspace-navigator.vercel.app",
  "description": "艺术品时空导航系统，通过AI助手、交互式地图和时间轴探索世界艺术珍品",
  "foundingDate": "2025",
  "sameAs": [
    "https://github.com/artspace-navigator"
  ]
});

// Generate structured data for artwork
export const generateArtworkStructuredData = (artwork: Artwork) => ({
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": artwork.title,
  "description": artwork.description,
  "alternateName": artwork.title,
  "creator": {
    "@type": "Person",
    "name": artwork.artist,
    "jobTitle": "Artist"
  },
  "dateCreated": artwork.year.toString(),
  "temporalCoverage": artwork.year.toString(),
  "artform": artwork.movement,
  "artMedium": artwork.medium,
  "artworkSurface": artwork.medium,
  "genre": artwork.period,
  "inLanguage": "zh-CN",
  "contentLocation": {
    "@type": "Place",
    "name": `${artwork.location.city}, ${artwork.location.country}`,
    "addressCountry": artwork.location.country,
    "addressLocality": artwork.location.city,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": artwork.location.coordinates[1],
      "longitude": artwork.location.coordinates[0]
    }
  },
  "image": artwork.imageUrl,
  "thumbnailUrl": artwork.imageUrl,
  "url": `https://artspace-navigator.vercel.app/artwork/${artwork.id}`,
  "keywords": [artwork.movement, artwork.period, artwork.artist, artwork.location.country].join(', '),
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://artspace-navigator.vercel.app/artwork/${artwork.id}`
  }
});

// Generate structured data for art collection
export const generateCollectionStructuredData = (artworks: Artwork[], location?: string, timeRange?: { start: number; end: number }) => {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": location 
      ? `${location}的艺术作品集合` 
      : "世界艺术作品集合",
    "description": `包含${artworks.length}件艺术作品的精选集合`,
    "numberOfItems": artworks.length,
    "collectionSize": artworks.length,
    "inLanguage": "zh-CN",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": artworks.length,
      "itemListElement": artworks.slice(0, 10).map((artwork, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "VisualArtwork",
          "name": artwork.title,
          "creator": artwork.artist,
          "dateCreated": artwork.year.toString(),
          "url": `https://artspace-navigator.vercel.app/artwork/${artwork.id}`
        }
      }))
    }
  };

  if (timeRange) {
    return {
      ...baseData,
      "temporalCoverage": `${timeRange.start}/${timeRange.end}`,
      "description": `${timeRange.start}-${timeRange.end}年间的艺术作品集合，包含${artworks.length}件作品`
    };
  }

  if (location) {
    return {
      ...baseData,
      "spatialCoverage": {
        "@type": "Place",
        "name": location
      }
    };
  }

  return baseData;
};

// Generate breadcrumb structured data
export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": {
      "@type": "WebPage",
      "@id": item.url,
      "name": item.name
    }
  }))
}
)