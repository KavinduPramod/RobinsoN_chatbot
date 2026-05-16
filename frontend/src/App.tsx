import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import ConfigModal from './components/ConfigModal';
import WelcomeScreen from './components/WelcomeScreen';
import { Message } from './types';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [email, setEmail] = useState<string>(localStorage.getItem('robin_user_email') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(!email);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat history and current chat on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('robin_chat_history') || '[]');
    const savedChatId = localStorage.getItem('robin_current_chat_id');
    
    setChatHistory(savedHistory);
    if (savedChatId) {
      setCurrentChatId(savedChatId);
    }
  }, []);

  // Load messages for current chat on mount or when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      const savedMessages = localStorage.getItem(`robin_chat_${currentChatId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`robin_chat_${currentChatId}`, JSON.stringify(messages));
    }
  }, [messages, currentChatId]);

  const handleRegister = async (userEmail: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        email: userEmail,
      });
      
      setEmail(userEmail);
      localStorage.setItem('robin_user_email', userEmail);
      setShowConfigModal(false);
      toast.success('Welcome to Robin! 👋', { autoClose: 2000 });
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register. Please try again.');
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !email) return;

    // Determine if this is a new chat before adding messages
    const isNewChat = !currentChatId;
    let chatIdToUse = currentChatId;

    if (isNewChat) {
      chatIdToUse = Date.now().toString();
      setCurrentChatId(chatIdToUse);
      localStorage.setItem('robin_current_chat_id', chatIdToUse);
      
      // Add to history immediately
      const newChat = {
        id: chatIdToUse,
        title: message.slice(0, 50),
        ts: Date.now(),
      };
      const updatedHistory = [newChat, ...chatHistory.slice(0, 19)];
      setChatHistory(updatedHistory);
      localStorage.setItem('robin_chat_history', JSON.stringify(updatedHistory));
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      // Save immediately for new chats
      if (isNewChat && chatIdToUse) {
        localStorage.setItem(`robin_chat_${chatIdToUse}`, JSON.stringify(updated));
      }
      return updated;
    });
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        email,
        message,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      console.log(`[Chat] Received response of ${response.data.content.length} characters`);
      console.log(`[Chat] Response preview: ${response.data.content.substring(0, 100)}...`);

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        // Save immediately
        if (chatIdToUse) {
          localStorage.setItem(`robin_chat_${chatIdToUse}`, JSON.stringify(updated));
        }
        return updated;
      });
    } catch (error) {
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.detail || 'Failed to send message'
        : 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    localStorage.removeItem('robin_current_chat_id');
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Clear this conversation?')) {
      handleNewChat();
    }
  };

  const handleStarterQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleLoadChat = (chatId: string) => {
    setCurrentChatId(chatId);
    localStorage.setItem('robin_current_chat_id', chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    if (window.confirm('Delete this conversation?')) {
      const updatedHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(updatedHistory);
      localStorage.setItem('robin_chat_history', JSON.stringify(updatedHistory));
      localStorage.removeItem(`robin_chat_${chatId}`);
      
      if (currentChatId === chatId) {
        handleNewChat();
      }
    }
  };

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      <Sidebar 
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
        userEmail={email}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader 
          title={messages.length === 0 ? 'New conversation' : messages[0]?.content?.slice(0, 45) + (messages[0]?.content?.length > 45 ? '…' : '')}
          subtitle={messages.length === 0 ? 'Robin is ready to help' : 'Active conversation'}
          onSettings={() => setShowConfigModal(true)}
          onClearChat={handleClearChat}
        />

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <WelcomeScreen onStarterClick={handleStarterQuestion} />
          ) : (
            <MessageList messages={messages} isLoading={isLoading} ref={messagesEndRef} />
          )}
        </div>

        {email && (
          <InputArea 
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        )}
      </div>

      {showConfigModal && (
        <ConfigModal 
          onRegister={handleRegister}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}

export default App;
