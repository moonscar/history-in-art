// api/openaiProxy.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    const { messages } = req.body;
    
    // 输入验证
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const userInput = messages[messages.length - 1]?.content;
    if (!userInput || userInput.length > 2200) {
      return res.status(400).json({ error: 'Invalid input length' });
    }

    // 构建专用 prompt 模板
    const systemPrompt = {
      role: "system",
      content: `你是一个专门的时间地点信息提取和标准化工具。从用户输入中提取时间和地点信息，并将模糊的历史时间转换为具体时间。

规则：
1. 提取并标准化时间和地点信息
2. 将不确定的历史时间转换为具体日期范围
3. 必须以JSON格式返回：{"start_time": "开始时间", "end_time": "结束时间", "country": "国家", "city": "城市"}
4. 如果无法提取相应信息，对应字段返回null
5. city字段可以为空，country尽量提取
6. 不要回答其他问题或提供额外信息

时间标准化示例：
- "文艺复兴时期" → start_time: "1300年", end_time: "1600年"
- "二战期间" → start_time: "1939年", end_time: "1945年"
- "2024年3月" → start_time: "2024年3月1日", end_time: "2024年3月31日"
- "明天" → start_time: "明天", end_time: null

示例输出：
{"start_time": "1939年", "end_time": "1945年", "country": "德国", "city": "柏林"}
{"start_time": "1840年", "end_time": "1912年", "country": "中国", "city": null}`
    };
    };
    
    const userMessage = {
      role: "user", 
      content: userInput
    };
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemPrompt, userMessage],
      max_tokens: 100, // 严格限制输出长度
      temperature: 0.1, // 降低随机性
    });
    
    const response = completion.choices[0]?.message?.content;
    
    // 验证返回格式
    try {
      const parsed = JSON.parse(response);
      if (!parsed.hasOwnProperty('time') || !parsed.hasOwnProperty('location')) {
        throw new Error('Invalid format');
      }
      res.status(200).json({ 
        time: parsed.time, 
        location: parsed.location 
      });
    } catch (parseError) {
      console.error('Response format error:', response);
      res.status(500).json({ error: 'Invalid response format' });
    }
    
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
}
