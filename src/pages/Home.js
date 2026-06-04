import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Prompt from "../components/Prompt";
import PreviousChats from "../components/PreviousChats";
import animationData from "../animations/Loading.json";
import Lottie from "react-lottie";
import "./Home.css";

const Home = () => {
  const [chatId, setChatId] = useState(null);
  const [chatExpanded, setChatExpanded] = useState(false); // State to track whether the chat is expanded

  const handleSelectChat = (selectedChatId) => {
    setChatId(selectedChatId); // Set the selected chat ID
    setChatExpanded(true); // Expand the chat area when a chat is selected
  };

  const handleUserInteraction = () => {
    setChatExpanded(true); // Expand the chat area when the user interacts with it
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const text = "How can I assist you today?";

  return (
    <div className={`home-container ${chatExpanded ? "expanded" : ""}`}>
      <PreviousChats onSelectChat={handleSelectChat} />

      <div className="main-chat-area">
        <AnimatePresence>
          {!chatExpanded && !chatId && (
            <motion.div
              className="intro-section"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
            >
              <Lottie options={defaultOptions} height={130} width={113} />
              <h1>{text}</h1>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="chat-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Prompt chatId={chatId} onUserInteraction={handleUserInteraction} />
        </motion.div>
      </div>
    </div>
  );
};

export default Home;