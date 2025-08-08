interface ChatResponse {
  location?: string;
  timeRange?: {
    start: number;
    end: number;
  };
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
      
      // 转换为产品逻辑需要的格式
      const result: ChatResponse = {
        message: '已从您的输入中提取时间和地点信息'
      };

      // 构建动态消息
      let messageParts = ['已从您的输入中提取'];
      const extractedInfo = [];
      
      if (result.location) {
        extractedInfo.push(`地点：${result.location}`);
      }
      
      if (result.timeRange) {
        const timeInfo = result.timeRange.start === result.timeRange.end 
          ? `${result.timeRange.start}年` 
          : `${result.timeRange.start}-${result.timeRange.end}年`;
        extractedInfo.push(`时间：${timeInfo}`);
      }

      if (extractedInfo.length > 0) {
        messageParts.push(extractedInfo.join('，'));
        messageParts.push('即将为您跳转到指定的时间地点查找相关艺术品数据...');
        result.message = messageParts.join(' ');
      } else {
        result.message = '未能从输入中提取到明确的时间和地点信息，请尝试更具体的描述。';
      }

      // 处理地点信息
      if (apiResponse.country) {
        result.location = apiResponse.country;
      }

      // 处理时间信息
      const startYear = this.parseTimeToYear(apiResponse.start_time);
      const endYear = this.parseTimeToYear(apiResponse.end_time);
      
      if (startYear !== null || endYear !== null) {
        result.timeRange = {
          start: startYear || 0,
          end: endYear || new Date().getFullYear()
        };
      }

      return result;

    } catch (error) {
      console.error('Error calling API:', error);
      return this.fallbackProcessing(userMessage);
    }
  }

  private static parseTimeToYear(timeStr: string | null): number | null {
    if (!timeStr) return null;
    
    const yearMatch = timeStr.match(/(\d{1,4})年?/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year < 100 && year > 0) {
        return year < 50 ? 2000 + year : 1900 + year;
      }
      return year;
    }
    
    if (timeStr.includes('今天') || timeStr.includes('现在')) {
      return new Date().getFullYear();
    }
    
    return null;
  }

  private static fallbackProcessing(query: string): ChatResponse {
    const queryLower = query.toLowerCase();
    let response: ChatResponse = {
      message: '抱歉，我无法连接到AI服务。使用本地处理为您查找相关内容。'
    };

    // 时间范围处理
    if (queryLower.includes('文艺复兴') || queryLower.includes('renaissance')) {
      response.timeRange = { start: 1400, end: 1600 };
      response.message += ' 已设置时间范围为文艺复兴时期。';
    } else if (queryLower.includes('巴洛克') || queryLower.includes('baroque')) {
      response.timeRange = { start: 1600, end: 1750 };
      response.message += ' 已设置时间范围为巴洛克时期。';
    } else if (queryLower.includes('现代') || queryLower.includes('modern')) {
      response.timeRange = { start: 1900, end: 1980 };
      response.message += ' 已设置时间范围为现代艺术时期。';
    }

    // 地点处理
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