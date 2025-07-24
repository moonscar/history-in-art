# ArtSpace Navigator

一个基于时空维度的智能艺术品导航系统，结合AI助手、交互式地图和时间轴，让用户通过自然语言探索世界各地的艺术珍品。

![ArtSpace Navigator](https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800)

## ✨ 核心功能

### 🗺️ 交互式世界地图
- **实时地图导航**：基于 Leaflet 的高性能地图组件
- **艺术品标记**：不同历史时期的艺术品用不同颜色标记
- **地点聚合**：同一地区的艺术品智能聚合显示
- **点击查询**：点击地图任意位置查询该地区艺术品

### ⏰ 智能时间轴
- **历史时期可视化**：直观显示各个艺术历史时期
- **拖拽筛选**：通过拖拽时间轴端点调整时间范围
- **实时同步**：与地图和搜索结果实时同步

### 🤖 AI 智能助手
- **自然语言理解**：支持中英文混合查询
- **智能解析**：自动提取地点和时间信息
- **联动控制**：AI 结果自动更新地图和时间轴
- **对话记录**：保存完整的对话历史

### 🎨 艺术品展示
- **详细信息**：包含艺术家、年代、流派、地点等完整信息
- **高清图片**：支持缩略图和高清大图展示
- **分类筛选**：按艺术家、流派、时期等多维度筛选
- **搜索功能**：全文搜索艺术品标题、描述等

## 🚀 技术栈

### 前端技术
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的开发体验
- **Tailwind CSS** - 实用优先的CSS框架
- **Vite** - 快速的构建工具

### 地图与可视化
- **Leaflet** - 开源地图库
- **React Leaflet** - React 地图组件
- **Lucide React** - 现代化图标库

### 后端与数据
- **Supabase** - 开源的 Firebase 替代方案
- **PostgreSQL** - 强大的关系型数据库
- **Row Level Security** - 数据安全保护

### AI 集成
- **OpenAI GPT-3.5** - 自然语言处理
- **智能查询解析** - 结构化数据提取

## 📦 安装与运行

### 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 账户
- OpenAI API Key（可选）

### 1. 克隆项目
```bash
git clone <repository-url>
cd artspace-navigator
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
创建 `.env` 文件并配置以下变量：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI 配置（可选）
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. 数据库设置
1. 在 Supabase 控制台创建新项目
2. 运行数据库迁移文件（位于 `supabase/migrations/`）
3. 确保 RLS 策略正确配置

### 5. 启动开发服务器
```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

## 🗄️ 数据库结构

### artworks 表
```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  artist_name VARCHAR(255),
  creation_year INTEGER,
  period VARCHAR(100),
  
  -- 地理位置信息
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- 内容描述
  description TEXT,
  cultural_context TEXT,
  
  -- 标签存储为JSON
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- 图片资源
  image_url TEXT,
  thumbnail_url TEXT,
  
  -- 显示控制
  map_display_priority INTEGER DEFAULT 5,
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 索引优化
- 地理位置索引（latitude, longitude）
- 时间范围索引（creation_year）
- 全文搜索索引（title, description）
- 标签 GIN 索引（tags）

## 🎯 使用指南

### AI 助手查询示例
```
"显示文艺复兴时期意大利的画作"
"查找19世纪法国的印象派作品"
"我想看看日本江户时代的艺术"
"梵高在法国创作的作品"
```

### 地图交互
1. **缩放导航**：使用鼠标滚轮或缩放控件
2. **点击标记**：查看该地区的艺术品详情
3. **点击空白区域**：查询该位置的艺术品
4. **标记颜色**：不同颜色代表不同历史时期

### 时间轴操作
1. **拖拽端点**：调整时间范围的起始和结束年份
2. **点击时期**：快速跳转到特定历史时期
3. **实时筛选**：时间范围变化时自动更新地图显示

## 🔧 开发指南

### 项目结构
```
src/
├── components/          # React 组件
│   ├── InteractiveWorldMap.tsx
│   ├── Timeline.tsx
│   ├── ChatInterface.tsx
│   ├── ArtworkModal.tsx
│   └── ...
├── services/           # 业务逻辑服务
│   ├── artworkService.ts
│   └── openaiService.ts
├── hooks/              # 自定义 React Hooks
│   └── useArtworks.ts
├── lib/                # 工具库
│   ├── supabase.ts
│   └── database.types.ts
├── types/              # TypeScript 类型定义
│   └── index.ts
└── data/               # 静态数据
    └── periods.ts
```

### 添加新的艺术品数据
1. 使用 `ArtworkService.createArtwork()` 方法
2. 或直接在 Supabase 控制台添加
3. 确保包含必要的地理位置信息

### 扩展 AI 功能
1. 修改 `src/services/openaiService.ts` 中的 prompt
2. 调整 JSON 响应结构
3. 更新前端处理逻辑

## 🚀 部署

### 构建生产版本
```bash
npm run build
```

### 部署选项
- **Vercel**：推荐，与 Supabase 集成良好
- **Netlify**：支持静态站点部署
- **自托管**：使用 nginx 或其他 web 服务器

### 环境变量配置
确保在生产环境中正确配置所有环境变量。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Supabase](https://supabase.com/) - 提供强大的后端服务
- [OpenAI](https://openai.com/) - AI 能力支持
- [Leaflet](https://leafletjs.com/) - 优秀的地图库
- [Pexels](https://pexels.com/) - 免费的艺术品图片资源

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 项目 Issues：[GitHub Issues](link-to-issues)
- 邮箱：your-email@example.com

---

**ArtSpace Navigator** - 让艺术探索变得更加智能和有趣！ 🎨✨