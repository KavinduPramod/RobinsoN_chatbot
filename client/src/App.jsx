import axios from "axios";
import { useState } from "react";
import "./App.css"; // Import CSS file

function Chatbot() {
  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([]); // Store all messages

  const sendMessage = async () => {
    if (!userMessage.trim()) return; // Prevent sending empty messages

    // Update messages with user input
    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", {
        message: userMessage,
        reset: true,
      });

      // Update messages with bot response
      setMessages((prev) => [
        ...prev,
        { text: response.data.response, sender: "bot" },
      ]);

      setUserMessage(""); // Clear input field
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error occurred while chatting.", sender: "bot" },
      ]);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]); // Clear all messages
  };

  return (
    <div>
      <div className="chatbot-container">
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
        </div>
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress} // Add onKeyPress event
          placeholder="Type your message here"
          className="input-field"
        />
        <div>
          <button onClick={sendMessage} className="send-button">
            Send
          </button>
          <button onClick={clearChat} className="clear-button">
            Clear Chat
          </button>
        </div>
      </div>
      <a
        href="https://kavindupramod.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-text"
      >
        Developed by Kavindu Pramod
      </a>
    </div>
  );
}

export default Chatbot;
