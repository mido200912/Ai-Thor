import React, { useState } from "react";
import axios from "axios";
import "./ChatInterface.css";

const ChatInterface = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem("companyApiKey") || "");
  const [company, setCompany] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCompany = async () => {
    if (!apiKey.trim()) {
      alert("Please enter your company's API key");
      return;
    }

    try {
      const res = await axios.get(`https://ai-thor-pkmr.vercel.app/api/public/company/${apiKey}`);
      if (res.data.success) {
        setCompany(res.data.company);
        localStorage.setItem("companyApiKey", apiKey);
      } else {
        alert("Company data not found");
      }
    } catch (err) {
      console.error("❌ Fetch company error:", err);
      alert("An error occurred while loading company data");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!company) {
      alert("Please load company data first!");
      return;
    }

    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await axios.post("https://ai-thor-pkmr.vercel.app/api/public/chat", {
        companyApiKey: apiKey,
        prompt,
      });

      const aiMsg = {
        role: "assistant",
        content: res.data.reply || "No response received from AI.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("❌ Chat error:", err);
      const errMsg = {
        role: "assistant",
        content: "An error occurred while communicating with the server.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutCompany = () => {
    localStorage.removeItem("companyApiKey");
    setCompany(null);
    setMessages([]);
    setApiKey("");
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        <h1 className="chat-header">🤖 AI Chat Assistant</h1>

        {!company ? (
          <div className="api-section">
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>Welcome!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Enter your Company API Key to start chatting.</p>
            <input
              type="text"
              placeholder="Enter your company API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button onClick={fetchCompany}>Load Company Data</button>
          </div>
        ) : (
          <>
            <div className="company-info">
              <div>
                <h2>{company.name}</h2>
                <p>{company.description || "No description available"}</p>
              </div>
              <button onClick={handleLogoutCompany} className="logout-btn">
                🔒 Logout
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: 'var(--text-secondary)' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>👋 Hello!</p>
                  <p>Start chatting with <strong>{company.name}</strong>'s AI assistant.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`message ${msg.role}`}>
                    <div className="message-bubble">{msg.content}</div>
                  </div>
                ))
              )}
              {loading && (
                <div className="message assistant">
                  <div className="message-bubble" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                    ⏳ Thinking...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="chat-input">
              <input
                type="text"
                placeholder="Type your message here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button type="submit" disabled={loading || !prompt.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
