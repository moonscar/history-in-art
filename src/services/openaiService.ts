interface ChatResponse {
  start_time?: string;
  end_time?: string;
  country?: string;
  city?: string;
  message: string;
}

interface APIResponse {
  start_time: string | null;
  end_time: string | null;
  country: string | null;
  city: string | null;
}

export class OpenAIService {
  static async processUserQuery(userMessage: string): Promise<ChatResponse> {
    try {
      const response = await fetch('/api/openaiProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) {
        throw new Error('API 调用失败');
      }

      const apiResponse: APIResponse = await response.json();

      return {
        start_time: apiResponse.start_time || undefined,
        end_time: apiResponse.end_time || undefined,
        country: apiResponse.country || undefined,
        city: apiResponse.city || undefined,
        message: '已从您的输入中提取时间和地点信息'
      };

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

    // 时间范围处理
    if (queryLower.includes('文艺复兴') || queryLower.includes('renaissance')) {
      response.start_time = '1400年';
      response.end_time = '1600年';
      response.message += ' 已设置时间范围为文艺复兴时期。';
    } else if (queryLower.includes('巴洛克') || queryLower.includes('baroque')) {
      response.start_time = '1600年';
      response.end_time = '1750年';
      response.message += ' 已设置时间范围为巴洛克时期。';
    } else if (queryLower.includes('现代') || queryLower.includes('modern')) {
      response.start_time = '1900年';
      response.end_time = '1980年';
      response.message += ' 已设置时间范围为现代艺术时期。';
    }

    // 地点处理
    if (queryLower.includes('意大利') || queryLower.includes('italy')) {
      response.country = 'Italy';
      response.message += ' 已筛选意大利地区的艺术品。';
    } else if (queryLower.includes('法国') || queryLower.includes('france')) {
      response.country = 'France';
      response.message += ' 已筛选法国地区的艺术品。';
    } else if (queryLower.includes('日本') || queryLower.includes('japan')) {
      response.country = 'Japan';
      response.message += ' 已筛选日本地区的艺术品。';
    }

    return response;
  }
}