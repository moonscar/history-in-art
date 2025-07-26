import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArtSpace Navigator - Explore Art Through Time and Space',
  description: '一个基于时空维度的智能艺术品导航系统，结合AI助手、交互式地图和时间轴，让用户通过自然语言探索世界各地的艺术珍品。',
  keywords: 'art, artwork, navigation, AI, interactive map, timeline, Renaissance, Baroque, Modern art',
  authors: [{ name: 'ArtSpace Navigator Team' }],
  openGraph: {
    title: 'ArtSpace Navigator - Explore Art Through Time and Space',
    description: '智能艺术品导航系统，通过AI助手和交互式地图探索世界艺术珍品',
    type: 'website',
    images: [
      {
        url: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'ArtSpace Navigator - Art Exploration Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ArtSpace Navigator - Explore Art Through Time and Space',
    description: '智能艺术品导航系统，通过AI助手和交互式地图探索世界艺术珍品',
    images: ['https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}