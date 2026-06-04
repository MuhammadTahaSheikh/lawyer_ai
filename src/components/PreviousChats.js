import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import "./PreviousChats.css";

const PreviousChats = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      const userId = auth.currentUser?.uid; // Get user_id from Firebase auth
      if (!userId) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.llglaw.ai/fetch_user_chats/?user_id=${userId}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Chats Data:", data.chats);

          const chatsWithNames = await Promise.all(
            data.chats.map(async (chat) => {
              try {
                const messagesResponse = await fetch(
                  `https://api.llglaw.ai/fetch_chat_messages/?chat_id=${chat.chat_id}`
                );

                if (messagesResponse.ok) {
                  const messagesData = await messagesResponse.json();
                  const firstMessage = messagesData.messages?.[0]?.query || null;

                  return {
                    ...chat,
                    chat_name: firstMessage || `Chat with ${chat.chat_id}`,
                  };
                }
              } catch (error) {
                console.error(`Error fetching messages for chat ${chat.chat_id}:`, error);
              }
              return chat; // Fall back to original chat object
            })
          );

          // Sort chats by most recent
          const sortedChats = chatsWithNames.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });

          setChats(sortedChats);
        } else {
          const errorMessage = await response.text();
          console.error("Failed to fetch chats:", errorMessage);
          setError("Failed to load chats.");
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        setError("An error occurred while fetching chats.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleDeleteChat = async (chatId) => {
    const userId = auth.currentUser?.uid; // Get user_id from Firebase auth
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://api.llglaw.ai/delete_chat/?chat_id=${chatId}&user_id=${userId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (response.ok) {
        // Remove the chat from the frontend
        setChats((prevChats) => prevChats.filter((chat) => chat.chat_id !== chatId));
        console.log(`Chat ${chatId} deleted successfully.`);
      } else {
        console.error("Failed to delete chat:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  if (loading) {
    return <div className="previous-chats-container">Loading chats...</div>;
  }

  if (error) {
    return <div className="previous-chats-container">{error}</div>;
  }

  if (chats.length === 0) {
    return <div className="previous-chats-container">No previous chats available.</div>;
  }

  return (
    <div className="previous-chats-container">
      <h2>Previous Chats</h2>
      <div className="chat-list">
        {chats.map((chat, index) => (
          <div key={index} className="chat-item-container">
            <div
              className="chat-item"
              onClick={() => onSelectChat(chat.chat_id)}
            >
              {chat.chat_name}
            </div>
            <button
              className="delete-icon"
              onClick={() => handleDeleteChat(chat.chat_id)}
              title="Delete Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviousChats;