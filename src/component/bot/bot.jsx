import React, { useState, useRef, useEffect } from "react";
import Spline from "@splinetool/react-spline";

const SimpleChatbot = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API;
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hello! How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate simple prompt for Gemini API
  const generateGeminiPrompt = (userMessage) => {
    return {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: userMessage,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 800,
      },
    };
  };

  const callGeminiAPI = async (userMessage) => {
    try {
      setIsLoading(true);

      // Fixed endpoint for Gemini API
      const endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      const prompt = generateGeminiPrompt(userMessage);

      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prompt),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Parse response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        const textParts = data.candidates[0].content.parts
          .map((part) => part.text)
          .filter(Boolean);
        return textParts.join("\n");
      } else if (data.candidates && data.candidates[0]) {
        // Try alternative response format
        return (
          data.candidates[0].text ||
          "Response received but in unexpected format."
        );
      } else {
        console.error("Unexpected API response structure:", data);
        return "I'm sorry, I couldn't process your request at this time. Please try again later.";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Sorry, there was an error communicating with the assistant. Please check your API key and try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    // Add user message to chat
    const userMessage = inputValue;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputValue("");

    // Show loading indicator
    setIsLoading(true);

    try {
      // Get response from Gemini API
      const botResponse = await callGeminiAPI(userMessage);
      setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
    } catch (error) {
      console.error("Error in message handling:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-row h-screen w-full bg-gray-100">
      {/* Left Side - 3D Model */}
      <div className="w-1/2 h-full relative">
        <Spline scene="https://prod.spline.design/Dd6XfySiMDZ1grm7/scene.splinecode" />
      </div>

      {/* Right Side - Chatbot */}
      <div className="w-1/2 h-full p-4">
        <div className="flex flex-col w-full h-full rounded-xl shadow-lg bg-white overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <h2 className="text-xl font-semibold m-0">
              Carbon FootPrint Chatbot
            </h2>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-100">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] p-3 rounded-2xl leading-relaxed break-words
                  ${
                    message.role === "user"
                      ? "self-end bg-blue-50 rounded-br-sm"
                      : "self-start bg-white rounded-bl-sm"
                  }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="self-start max-w-[80%] p-3 rounded-2xl rounded-bl-sm bg-white">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "200ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "400ms" }}
                  ></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex p-4 bg-gray-50 border-t border-gray-200">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows={2}
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={inputValue.trim() === "" || isLoading}
              className="ml-3 px-6 bg-blue-600 text-white font-semibold rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChatbot;
