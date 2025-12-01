import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./CompanyDashboard.css";

export default function CompanyDashboard() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [prompt, setPrompt] = useState("Write an attractive description for my company");

  const token = localStorage.getItem("token");
  const API_URL = (process.env.REACT_APP_API_URL || "https://ai-thor5.vercel.app/api") + "/company";

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const res = await axios.get(`${API_URL}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompany(res.data.company || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(company.apiKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleTestAI = async () => {
    if (!company?.apiKey) return alert("API Key not found");
    try {
      const res = await axios.post("https://ai-thor5.vercel.app/api/company/use-model", {
        apiKey: company.apiKey,
        prompt
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAiResponse(res.data.reply);
    } catch (err) {
      console.error("AI error:", err);
      setAiResponse("An error occurred while connecting to AI. Make sure the backend supports this endpoint.");
    }
  };

  if (loading) return <div className="dashboard-container"><div className="dashboard-content" style={{ textAlign: 'center' }}>Loading...</div></div>;
  if (!company) return <div className="dashboard-container"><div className="dashboard-content" style={{ textAlign: 'center' }}>Company not found</div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <motion.h1
          className="dashboard-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          AI Dashboard
        </motion.h1>

        {/* Company Info */}
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="card-header">{company.name}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Description</span>
              <p className="info-value">{company.description}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Industry</span>
              <p className="info-value">{company.industry || "Not specified"}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Vision</span>
              <p className="info-value">{company.vision || "Not specified"}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Mission</span>
              <p className="info-value">{company.mission || "Not specified"}</p>
            </div>
          </div>
        </motion.div>

        {/* API Key */}
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="card-header">AI API Key</h3>
          <div className="api-key-section">
            <div className="api-key-text">{company.apiKey}</div>
            <button onClick={copyToClipboard} className="copy-btn">
              {copySuccess ? "Copied! ✅" : "Copy Key"}
            </button>
          </div>
        </motion.div>

        {/* Test AI */}
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="card-header">Test the AI</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="test-ai-input"
            placeholder="Enter a prompt to test your company's AI model..."
          />
          <button onClick={handleTestAI} className="send-btn">
            Generate Response
          </button>

          {aiResponse && (
            <motion.div
              className="ai-response"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <strong>AI Response:</strong>
              <p>{aiResponse}</p>
            </motion.div>
          )}
        </motion.div>

        {/* API Usage Instructions */}
        <motion.div
          className="dashboard-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="card-header">How to Use the API</h3>
          <div className="code-block">
            <pre>
              {`POST https://ai-thor5.vercel.app/api/public/chat
Content-Type: application/json

{
  "companyApiKey": "${company.apiKey}",
  "prompt": "Write an attractive description for my company"
}`}
            </pre>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
