import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object | object[];
  canonical?: string;
  hreflang?: Array<{ lang: string; url: string }>;
  robots?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "ArtSpace Navigator - 艺术品时空导航网站 | 探索世界艺术珍品",
  description = "探索世界各地的艺术珍品，通过时空维度智能导航系统，结合AI助手、交互式地图和时间轴，发现不同历史时期的艺术作品。",
  keywords = "艺术品,艺术导航,世界艺术,历史艺术,艺术地图,艺术时间轴,文艺复兴,巴洛克,印象派,现代艺术",
  image = "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1200",
  url = "https://artspace-navigator.vercel.app",
  type = "website",
  structuredData,
  canonical,
  hreflang = [],
  robots = "index, follow"
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="author" content="ArtSpace Navigator" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Language and region */}
      <html lang="zh-CN" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="ArtSpace Navigator" />
      <meta property="og:locale" content="zh_CN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@ArtSpaceNav" />
      <meta name="twitter:creator" content="@ArtSpaceNav" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || url} />
      
      {/* Hreflang for international SEO */}
      {hreflang.map(({ lang, url: hrefUrl }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={hrefUrl} />
      ))}
      
      {/* Additional meta tags for better SEO */}
      <meta name="theme-color" content="#1F2937" />
      <meta name="msapplication-TileColor" content="#1F2937" />
      
      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(data)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Helmet>
  );
};

export default SEOHead;