import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const CampusAssistant = ({ onSendMessage, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const sampleQueries = [
    '📅 When is the placement drive?',
    '💼 How do I register for internships?',
    '🎓 What are the hostel rules?',
    '🏆 When is TechFest?',
    '❓ How do I use CampusConnect?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e, customMessage = null) => {
    e.preventDefault();
    
    const messageText = customMessage || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMsg = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Get AI response
    const response = await onSendMessage(messageText);
    const assistantMsg = { 
      role: 'assistant', 
      content: response.message,
      isRefusal: response.refusal
    };
    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <>
      {/* Chat Button - Fixed Position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110 animate-bounce"
        title="Campus Assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-24px)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold text-lg">🤖 Campus Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded p-1 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-4">
                <p className="font-semibold mb-3">👋 Hi! I'm your Campus Assistant</p>
                <p className="mb-3 text-xs">Ask me about placements, internships, campus rules, events, or how to use CampusConnect.</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">📌 Quick Questions:</p>
                  {sampleQueries.map((query, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleSendMessage(e, query)}
                      className="w-full text-left text-xs bg-white hover:bg-indigo-50 p-2 rounded border border-gray-200 hover:border-indigo-400 transition cursor-pointer truncate"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : msg.isRefusal
                          ? 'bg-yellow-100 text-gray-800 rounded-bl-none border border-yellow-300'
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none">
                  <p className="text-sm text-gray-600">Typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CampusAssistant;
