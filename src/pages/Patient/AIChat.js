import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'react-toastify';
import { sendChatMessage } from '../../services/apiService';
import { FiMessageSquare, FiSend } from 'react-icons/fi';
import '../Dashboard.css';
import './AIChat.css';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(input);
      const aiMessage = { text: response.data.answer || response.data.data?.answer, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again.', sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="patient" />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1><FiMessageSquare /> AI Health Assistant</h1>
          <p>Ask questions about your medical records and health</p>
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🤖</div>
                <h3>Start a conversation</h3>
                <p>Ask me about your medical history, test results, or health questions</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="message ai">
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button 
              className="chat-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
