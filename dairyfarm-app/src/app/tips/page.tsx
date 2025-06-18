'use client'; // This is a Client Component

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { toast } from 'react-hot-toast'; // Import toast for notifications

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export default function TipsPage() {
  const { user, authFetch } = useAuth(); // Destructure authFetch from useAuth
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Static Dairy Farm Tips
  const dairyTips = [
    "Ensure proper nutrition: A balanced diet is crucial for milk production and herd health. Consult with a nutritionist.",
    "Maintain strict hygiene: Cleanliness in milking parlors, stalls, and equipment prevents diseases and ensures milk quality.",
    "Implement a robust vaccination program: Protect your herd from common diseases like mastitis and brucellosis.",
    "Monitor herd health regularly: Daily checks for signs of illness, lameness, or stress can prevent major outbreaks.",
    "Optimize milking routines: Consistent and gentle milking practices reduce stress on cows and improve milk yield.",
    "Manage breeding efficiently: Use AI (Artificial Insemination) and track estrus cycles for effective reproduction.",
    "Provide comfortable housing: Adequate ventilation, bedding, and space reduce heat stress and improve welfare.",
    "Ensure ample clean water supply: Hydration is critical for milk production, often overlooked.",
    "Proper waste management: Implement sustainable practices for manure and wastewater to protect the environment.",
    "Keep detailed records: Track milk production, health events, breeding, and costs for informed decision-making."
  ];

  // Function to send message to the AI backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage.trim(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsBotTyping(true);

    try {
      // --- ACTUAL API CALL TO YOUR BACKEND AI ROUTE ---
      const apiResponse = await authFetch('/chat', { // Calling your /api/chat route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newUserMessage.text }), // Sending the user's message
      });

      // Assuming your backend returns { response: "AI's generated text" }
      const newBotMessage: ChatMessage = {
        id: messages.length + 2, // Ensure unique ID for the bot's message
        sender: 'bot',
        text: apiResponse.response,
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);

    } catch (error: any) {
      console.error('Failed to get AI response from backend:', error);
      toast.error(error.message || 'Could not get a response from the AI. Please try again.');
      // Add a generic error message from the bot if the API call fails
      const errorBotMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: "Sorry, I couldn't get a response from the server. There might be a temporary issue.",
      };
      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Dairy Farm Insights</h1>

      {/* Static Tips Section */}
      <section className="bg-white shadow-lg rounded-lg p-6 mb-10 border border-blue-200">
        <h2 className="text-2xl font-semibold text-blue-700 mb-5 border-b pb-3">Essential Dairy Farm Tips</h2>
        <ul className="list-disc pl-5 space-y-3 text-gray-700">
          {dairyTips.map((tip, index) => (
            <li key={index} className="leading-relaxed text-lg">
              <strong className="text-blue-600">Tip {index + 1}:</strong> {tip}
            </li>
          ))}
        </ul>
      </section>

      {/* AI Bot Section */}
      <section className="bg-white shadow-lg rounded-lg p-6 border border-green-200">
        <h2 className="text-2xl font-semibold text-green-700 mb-5 border-b pb-3">Ask Our AI Farm Assistant</h2>
        <div className="flex flex-col h-[500px] border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
          {/* Chat Messages Display */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 italic mt-10">
                Type a message below to start a conversation with your AI Farm Assistant!
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-300 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isBotTyping && (
                <div className="flex justify-start">
                    <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-gray-300 text-gray-800 rounded-bl-none">
                        <span className="animate-pulse">...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300 bg-white flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about dairy farming..."
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isBotTyping}
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300 ease-in-out flex items-center justify-center"
              disabled={isBotTyping}
            >
              {isBotTyping ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}