import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Bot, User, ChevronDown, ChevronUp } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onQueryUpdate: (params: {
    timeRange?: { start: number; end: number };
    location?: string;
    movement?: string;
    artist?: string;
  }) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onQueryUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '您好！我是您的艺术品导航助手。您可以通过自然语言告诉我您想要查找的艺术品，比如："显示文艺复兴时期意大利的画作"或"查找梵高在1880-1890年间的作品"。',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 模拟AI处理用户查询
  const processUserQuery = async (query: string) => {
    setIsLoading(true);
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的关键词匹配逻辑（实际应用中会调用真实的AI API）
    const queryLower = query.toLowerCase();
    let response = '';
    let queryParams: any = {};

    // 时间范围识别
    if (queryLower.includes('文艺复兴') || queryLower.includes('renaissance')) {
      queryParams.timeRange = { start: 1400, end: 1600 };
      response += '已设置时间范围为文艺复兴时期（1400-1600年）。';
    } else if (queryLower.includes('巴洛克') || queryLower.includes('baroque')) {
      queryParams.timeRange = { start: 1600, end: 1750 };
      response += '已设置时间范围为巴洛克时期（1600-1750年）。';
    } else if (queryLower.includes('现代') || queryLower.includes('modern')) {
      queryParams.timeRange = { start: 1900, end: 1980 };
      response += '已设置时间范围为现代艺术时期（1900-1980年）。';
    }

    // 地点识别
    if (queryLower.includes('意大利') || queryLower.includes('italy')) {
      queryParams.location = 'Italy';
      response += '已筛选意大利地区的艺术品。';
    } else if (queryLower.includes('法国') || queryLower.includes('france')) {
      queryParams.location = 'France';
      response += '已筛选法国地区的艺术品。';
    } else if (queryLower.includes('日本') || queryLower.includes('japan')) {
      queryParams.location = 'Japan';
      response += '已筛选日本地区的艺术品。';
    }

    // 艺术家识别
    if (queryLower.includes('达芬奇') || queryLower.includes('leonardo')) {
      queryParams.artist = 'Leonardo da Vinci';
      response += '已筛选达芬奇的作品。';
    } else if (queryLower.includes('梵高') || queryLower.includes('van gogh')) {
      queryParams.artist = 'Vincent van Gogh';
      response += '已筛选梵高的作品。';
    } else if (queryLower.includes('毕加索') || queryLower.includes('picasso')) {
      queryParams.artist = 'Pablo Picasso';
      response += '已筛选毕加索的作品。';
    }

    // 艺术流派识别
    if (queryLower.includes('印象派') || queryLower.includes('impressionism')) {
      queryParams.movement = 'Impressionism';
      response += '已筛选印象派作品。';
    } else if (queryLower.includes('立体派') || queryLower.includes('cubism')) {
      queryParams.movement = 'Cubism';
      response += '已筛选立体派作品。';
    }

    if (!response) {
      response = '抱歉，我没有理解您的查询。请尝试使用更具体的描述，比如时间期间、地点或艺术家名称。';
    } else {
      onQueryUpdate(queryParams);
    }

    setIsLoading(false);
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    const response = await processUserQuery(inputText);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`bg-black/80 backdrop-blur-sm rounded-xl shadow-2xl flex flex-col transition-all duration-300 ${isExpanded ? 'h-96' : 'h-12'}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/50 transition-colors rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} className="text-blue-400" />
          <h3 className="text-white font-medium text-sm">AI 艺术品助手</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="border-t border-gray-700"></div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <Bot size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <User size={16} className="text-blue-200 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} className="text-blue-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的查询，例如：显示文艺复兴时期意大利的画作..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg px-4 py-2 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;