import React, { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { Player } from "@lottiefiles/react-lottie-player";
import { auth } from "../firebase/firebase"; // Import Firebase auth
import loadingAnimation from "../animations/Loading.json";
import "./Prompt.css";

const Prompt = ({ onUserInteraction, chatId }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId || null);

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    }
  }, [chatId]);

  const fetchChatMessages = async (chatId) => {
    try {
      const response = await fetch(`https://api.llglaw.ai/fetch_chat_messages/?chat_id=${chatId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Messages:", data);

        const formattedMessages = data.messages
          .map((msg) => [
            { type: "user", text: msg.query },
            { type: "response", text: msg.model_reply },
          ])
          .flat();

        setMessages(formattedMessages);
      } else {
        console.error("Failed to fetch chat messages:", await response.text());
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    // Notify Home component of interaction
    if (onUserInteraction) {
      onUserInteraction();
    }

    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    // Append user message to chat
    const userMessage = { type: "user", text: input.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsLoading(true);

    try {
      const payload = {
        user_id: user.uid,
        chat_id: currentChatId || "",
        query: input.trim(),
        chat_history: messages.map((msg) => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.text,
        })),
      };

      const response = await fetch("https://api.llglaw.ai/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Chat response:", data);

        if (!currentChatId && data.chat_id) {
          setCurrentChatId(data.chat_id); // Set chat ID for future interactions
        }

        const assistantMessage = { type: "response", text: data.model_reply };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        console.error("Failed to send message:", await response.text());
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      setInput(""); // Clear input after message is sent
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInput("");
    setCurrentChatId(null);
    if (onUserInteraction) {
      onUserInteraction();
    }
  };

  return (
    <div className="prompt-container">
      {/* Reset Icon */}
      {messages.length > 0 && (
        <div className="reset-icon-container" onClick={handleResetChat}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="reset-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </div>
      )}

      {/* Display Chat Messages */}
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ))}

        {/* Loading Animation */}
        {isLoading && (
          <div className="message response">
            <Player
              autoplay
              loop
              src={loadingAnimation}
              style={{ height: "50px", width: "50px" }}
            />
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="prompt-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="prompt-input"
        />
        <button type="submit" className="prompt-button">
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default Prompt;