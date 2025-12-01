import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaWhatsapp, FaShopify, FaCode } from 'react-icons/fa';
import './Dashboard.css'; // Reuse dashboard styles for consistency

const Integrations = () => {
    const [activeTab, setActiveTab] = useState('all');

    const integrations = [
        {
            id: 'facebook',
            name: 'Facebook',
            icon: <FaFacebook size={40} color="#1877F2" />,
            description: 'Connect your Facebook Page to automate replies and manage messages.',
            status: 'disconnected',
            category: 'social'
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: <FaInstagram size={40} color="#E4405F" />,
            description: 'Link your Instagram Business account for auto-replies and story interactions.',
            status: 'disconnected',
            category: 'social'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: <FaWhatsapp size={40} color="#25D366" />,
            description: 'Automate WhatsApp Business messages and support.',
            status: 'disconnected',
            category: 'social'
        },
        {
            id: 'shopify',
            name: 'Shopify',
            icon: <FaShopify size={40} color="#96bf48" />,
            description: 'Sync products and orders to help customers buy directly via chat.',
            status: 'disconnected',
            category: 'ecommerce'
        }
    ];

    const handleConnect = (platform) => {
        // In a real app, this would trigger the OAuth flow
        alert(`Connecting to ${platform}... (This is a demo)`);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                <h1 className="dashboard-title">Integrations</h1>
                <p className="dashboard-subtitle">Connect your favorite platforms to AiThor.</p>

                <div className="integration-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        All
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        Social Media
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'ecommerce' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ecommerce')}
                    >
                        E-Commerce
                    </button>
                </div>

                <div className="integrations-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {integrations
                        .filter(item => activeTab === 'all' || item.category === activeTab)
                        .map((item) => (
                            <motion.div
                                key={item.id}
                                className="glass-card integration-card"
                                whileHover={{ scale: 1.02 }}
                                style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                            >
                                <div className="icon-wrapper" style={{ marginBottom: '15px' }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ color: 'white', marginBottom: '10px' }}>{item.name}</h3>
                                <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '20px', flex: 1 }}>
                                    {item.description}
                                </p>
                                <button
                                    className="primary-btn"
                                    onClick={() => handleConnect(item.name)}
                                    style={{ width: '100%' }}
                                >
                                    Connect
                                </button>
                            </motion.div>
                        ))}
                </div>

                <div className="widget-section" style={{ marginTop: '40px' }}>
                    <h2 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCode /> No-Code Widget
                    </h2>
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <p style={{ color: '#ccc', marginBottom: '15px' }}>
                            Copy and paste this code into your website's <code>&lt;body&gt;</code> tag to add the AiThor chat bubble.
                        </p>
                        <div className="code-block" style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', position: 'relative' }}>
                            <code style={{ color: '#00ff88', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                &lt;script src="https://ai-thor-pkmr.vercel.app/api/integrations/widget/script.js?companyId=YOUR_COMPANY_ID"&gt;&lt;/script&gt;
                            </code>
                            <button
                                style={{ position: 'absolute', top: '10px', right: '10px', background: '#333', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => navigator.clipboard.writeText('<script src="https://ai-thor-pkmr.vercel.app/api/integrations/widget/script.js?companyId=YOUR_COMPANY_ID"></script>')}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;
