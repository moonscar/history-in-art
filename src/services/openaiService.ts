import OpenAI from 'openai';

interface ChatResponse {
  location?: string;
  timeRange?: {
    start: number;
    end: number;
  };
  message: string;
}

export class OpenAIService {
  private static openai: OpenAI | null = null;

  private static getClient(): OpenAI {
    if (!this.openai) {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
      }
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
    }
    return this.openai;
  }

  static async processUserQuery(userMessage: string): Promise<ChatResponse> {
    try {
      const client = this.getClient();
      
      const systemPrompt = `你是一个艺术品导航助手。用户会询问关于艺术品的问题，你需要从用户的查询中提取地点和时间信息。

请分析用户的查询，并返回一个JSON格式的响应，包含以下字段：
- location: 地点名称（如果用户提到了具体国家或城市）
- timeRange: 时间范围对象，包含start和end年份（如果用户提到了时间期间）
- message: 给用户的友好回复消息

支持的地点包括：Italy, France, Spain, Netherlands, Japan, United States
支持的时间期间包括：
- 文艺复兴时期: 1400-1600
- 巴洛克时期: 1600-1750  
- 印象派时期: 1850-1900
- 现代艺术: 1900-1980
- 当代艺术: 1980-2024

示例：
用户："显示文艺复兴时期意大利的画作"
响应：{
  "location": "Italy",
  "timeRange": {"start": 1400, "end": 1600},
  "message": "已为您筛选文艺复兴时期（1400-1600年）意大利的艺术作品。"
}

用户："查找梵高的作品"
响应：{
  "message": "梵高是荷兰后印象派画家，主要活跃于1880-1890年代。已为您搜索相关作品。"
}

请确保返回有效的JSON格式。`;

      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse JSON response
      try {
        const parsedResponse = JSON.parse(responseText);
        return {
          location: parsedResponse.location,
          timeRange: parsedResponse.timeRange,
          message: parsedResponse.message || '已处理您的查询。'
        };
      } catch (parseError) {
        // If JSON parsing fails, return the text as message
        return {
          message: responseText
        };
      }

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      
      // Fallback to simple keyword matching
      return this.fallbackProcessing(userMessage);
    }
  }

  private static fallbackProcessing(query: string): ChatResponse {
    const queryLower = query.toLowerCase();
    let response: ChatResponse = {
      message: '抱歉，我无法连接到AI服务。使用本地处理为您查找相关内容。'
    };

    // Simple keyword matching as fallback
    if (queryLower.includes('文艺复兴') || queryLower.includes('renaissance')) {
      response.timeRange = { start: 1400, end: 1600 };
      response.message += ' 已设置时间范围为文艺复兴时期（1400-1600年）。';
    } else if (queryLower.includes('巴洛克') || queryLower.includes('baroque')) {
      response.timeRange = { start: 1600, end: 1750 };
      response.message += ' 已设置时间范围为巴洛克时期（1600-1750年）。';
    } else if (queryLower.includes('现代') || queryLower.includes('modern')) {
      response.timeRange = { start: 1900, end: 1980 };
      response.message += ' 已设置时间范围为现代艺术时期（1900-1980年）。';
    }

    if (queryLower.includes('意大利') || queryLower.includes('italy')) {
      response.location = 'Italy';
      response.message += ' 已筛选意大利地区的艺术品。';
    } else if (queryLower.includes('法国') || queryLower.includes('france')) {
      response.location = 'France';
      response.message += ' 已筛选法国地区的艺术品。';
    } else if (queryLower.includes('日本') || queryLower.includes('japan')) {
      response.location = 'Japan';
      response.message += ' 已筛选日本地区的艺术品。';
    }

    return response;
  }
}