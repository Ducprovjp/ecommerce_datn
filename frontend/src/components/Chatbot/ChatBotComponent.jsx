import React, { useState } from "react";
import axios from "axios";

const ChatbotComponent = () => {
  const [messages, setMessages] = useState([
    {
      text: "Chào bạn! Tôi có thể giúp gì về sản phẩm hoặc dịch vụ?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // Trạng thái mở/đóng khung chat

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_SERVER}/chatbot/dialogflow`,
        { message: input },
        { withCredentials: true }
      );
      const botMessage = { text: res.data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error.response || error.message);
      const errorMessage = {
        text: "Lỗi kết nối, vui lòng thử lại!",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setInput("");
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen); // Mở/đóng khung chat
  };

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}
    >
      {/* Icon message nhấp nháy */}
      {!isChatOpen && (
        <div
          onClick={toggleChat}
          style={{
            width: "50px",
            height: "50px",
            background: "#007bff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            animation: "pulse 2s infinite",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      )}

      {/* Khung chat */}
      {isChatOpen && (
        <div
          style={{
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            width: "300px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Thanh tiêu đề */}
          <div
            style={{
              background: "#007bff",
              color: "white",
              padding: "10px",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Chatbot Assistant</span>
            <button
              onClick={toggleChat}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Khu vực tin nhắn */}
          <div
            style={{
              height: "300px",
              overflowY: "scroll",
              padding: "10px",
              background: "#f9f9f9",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  margin: "5px",
                }}
              >
                <span
                  style={{
                    background: msg.sender === "user" ? "#007bff" : "#e1e1e1",
                    color: msg.sender === "user" ? "white" : "black",
                    padding: "8px 12px",
                    borderRadius: "15px",
                    maxWidth: "70%",
                    display: "inline-block",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          {/* Khu vực nhập liệu */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #eee",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "5px",
              }}
              placeholder="Nhập tin nhắn..."
            />
            <button
              onClick={sendMessage}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* CSS cho hiệu ứng nhấp nháy */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
            }
            70% {
              transform: scale(1.05);
              box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ChatbotComponent;
