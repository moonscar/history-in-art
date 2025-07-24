interface ChatResponse {
  location?: string;
  timeRange?: {
    start: number;
    end: number;
  };
  message: string;
}

export class OpenAIService {
  static async processUserQuery(userMessage: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/openaiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      const parsedResponse = await response.json();
      return parsedResponse;
    } catch (error) {
      console.error('Error calling API:', error);
      return this.fallbackProcessing(userMessage);
    }
  }

  private static fallbackProcessing(query: string): ChatResponse {
    const queryLower = query.toLowerCase();
    let response: ChatResponse = {
      message: '抱歉，我无法连接到AI服务。使用本地处理为您查找相关内容。'
    };

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
