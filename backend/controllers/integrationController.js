import axios from 'axios';
import Integration from '../models/Integration.js';

// Helper to get base URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// @desc    Initiate Meta OAuth (Facebook/Instagram/WhatsApp)
// @route   GET /api/integrations/meta/login
// @access  Private (via query param or session in real app, simplified here)
const metaLogin = (req, res) => {
    const { companyId } = req.query;
    if (!companyId) return res.status(400).send('Company ID required');

    const appId = process.env.META_APP_ID;
    const redirectUri = `${BASE_URL}/api/integrations/meta/callback`;
    const state = companyId; // Passing companyId as state to retrieve it in callback
    const scope = 'pages_show_list,pages_messaging,instagram_basic,instagram_manage_messages,whatsapp_business_messaging';

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    res.redirect(authUrl);
};

// @desc    Handle Meta OAuth Callback
// @route   GET /api/integrations/meta/callback
// @access  Public
const metaCallback = async (req, res) => {
    const { code, state: companyId, error } = req.query;

    if (error) {
        return res.status(400).send(`Meta Auth Error: ${error}`);
    }

    if (!code || !companyId) {
        return res.status(400).send('Missing code or companyId');
    }

    try {
        // 1. Exchange code for access token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${BASE_URL}/api/integrations/meta/callback&client_secret=${process.env.META_APP_SECRET}&code=${code}`;

        const { data: tokenData } = await axios.get(tokenUrl);
        const { access_token } = tokenData;

        // 2. Get User's Pages
        const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`;
        const { data: pagesData } = await axios.get(pagesUrl);

        // For MVP, just taking the first page. In real app, let user select.
        const page = pagesData.data[0];

        if (!page) {
            return res.status(400).send('No Facebook Pages found for this account.');
        }

        // 3. Save Integration
        await Integration.findOneAndUpdate(
            { company: companyId, platform: 'facebook' },
            {
                credentials: {
                    accessToken: page.access_token, // Page Access Token
                    pageId: page.id,
                    userAccessToken: access_token
                },
                isActive: true
            },
            { new: true, upsert: true }
        );

        // Redirect back to dashboard
        res.redirect('http://localhost:3000/dashboard?status=success&platform=facebook');

    } catch (err) {
        console.error('Meta Auth Error:', err.response?.data || err.message);
        res.redirect('http://localhost:3000/dashboard?status=error&platform=facebook');
    }
};

// @desc    Initiate Shopify OAuth
// @route   GET /api/integrations/shopify/login
// @access  Private
const shopifyLogin = (req, res) => {
    const { shop, companyId } = req.query;
    if (!shop || !companyId) return res.status(400).send('Shop URL and Company ID required');

    const apiKey = process.env.SHOPIFY_API_KEY;
    const scopes = 'read_products,read_orders';
    const redirectUri = `${BASE_URL}/api/integrations/shopify/callback`;
    const state = companyId; // Nonce in real app

    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    res.redirect(authUrl);
};

// @desc    Handle Shopify OAuth Callback
// @route   GET /api/integrations/shopify/callback
// @access  Public
const shopifyCallback = async (req, res) => {
    const { shop, code, state: companyId } = req.query;

    if (!shop || !code || !companyId) {
        return res.status(400).send('Missing parameters');
    }

    try {
        // Exchange code for access token
        const tokenUrl = `https://${shop}/admin/oauth/access_token`;
        const { data } = await axios.post(tokenUrl, {
            client_id: process.env.SHOPIFY_API_KEY,
            client_secret: process.env.SHOPIFY_API_SECRET,
            code
        });

        const { access_token } = data;

        // Save Integration
        await Integration.findOneAndUpdate(
            { company: companyId, platform: 'shopify' },
            {
                credentials: {
                    shopUrl: shop,
                    accessToken: access_token
                },
                isActive: true
            },
            { new: true, upsert: true }
        );

        res.redirect('http://localhost:3000/dashboard?status=success&platform=shopify');

    } catch (err) {
        console.error('Shopify Auth Error:', err.response?.data || err.message);
        res.redirect('http://localhost:3000/dashboard?status=error&platform=shopify');
    }
};

// @desc    Handle Meta Webhooks (Messenger, Instagram, WhatsApp)
// @route   POST /api/webhooks/meta
// @access  Public
const metaWebhook = async (req, res) => {
    // Verification challenge
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token']) {
        // In production, verify the token matches your env variable
        console.log('Webhook verified');
        return res.status(200).send(req.query['hub.challenge']);
    }

    // Handle incoming messages
    try {
        const body = req.body;
        // Logic to process message and trigger AI response would go here
        console.log('Received Meta webhook:', JSON.stringify(body, null, 2));
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};

// @desc    Handle Shopify Webhooks
// @route   POST /api/webhooks/shopify
// @access  Public
const shopifyWebhook = async (req, res) => {
    try {
        console.log('Received Shopify webhook:', req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
};

// @desc    Serve the No-Code Widget Script
// @route   GET /api/widget/script.js
// @access  Public
const getWidgetScript = async (req, res) => {
    const { companyId } = req.query;
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

    const script = `
    (function() {
      const companyId = "${companyId}";
      const baseUrl = "${BASE_URL}";
      if (!companyId) return;

      // Inject CSS for animations
      const style = document.createElement('style');
      style.textContent = \`
        @keyframes aithor-fadeIn {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes aithor-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .aithor-chat-bubble {
          animation: aithor-pulse 2s infinite ease-in-out;
        }
        .aithor-chat-bubble:hover {
          transform: scale(1.1) !important;
          animation: none;
        }
        .aithor-chat-window {
          animation: aithor-fadeIn 0.3s ease-out;
        }
      \`;
      document.head.appendChild(style);

      // Create Chat Bubble with gradient
      const bubble = document.createElement('div');
      bubble.className = 'aithor-chat-bubble';
      bubble.style.cssText = \`
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      \`;
      bubble.innerHTML = \`
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      \`;
      
      // Create Chat Window
      const chatWindow = document.createElement('div');
      chatWindow.className = 'aithor-chat-window';
      chatWindow.style.cssText = \`
        position: fixed;
        bottom: 100px;
        right: 24px;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        z-index: 999998;
        overflow: hidden;
      \`;
      
      // Header with gradient
      const header = document.createElement('div');
      header.style.cssText = \`
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        justify-content: space-between;
        align-items: center;
      \`;
      header.innerHTML = \`
        <div>
          <div style="font-weight: 600; font-size: 18px;">AiThor Support</div>
          <div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">We're here to help!</div>
        </div>
        <button id="aithor-close-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      \`;
      chatWindow.appendChild(header);

      // Chat iframe
      const iframe = document.createElement('iframe');
      iframe.style.cssText = \`
        flex: 1;
        border: none;
        width: 100%;
        height: 100%;
      \`;
      iframe.src = \`\${baseUrl}/company-chat/\${companyId}\`;
      chatWindow.appendChild(iframe);

      // Powered by footer
      const footer = document.createElement('div');
      footer.style.cssText = \`
        padding: 12px;
        text-align: center;
        font-size: 11px;
        color: #999;
        border-top: 1px solid #eee;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      \`;
      footer.innerHTML = 'Powered by <strong style="color: #667eea;">AiThor</strong>';
      chatWindow.appendChild(footer);

      document.body.appendChild(bubble);
      document.body.appendChild(chatWindow);

      // Toggle chat window
      bubble.addEventListener('click', () => {
        if (chatWindow.style.display === 'none') {
          chatWindow.style.display = 'flex';
          bubble.style.transform = 'scale(0.9)';
        } else {
          chatWindow.style.display = 'none';
          bubble.style.transform = 'scale(1)';
        }
      });

      // Close button
      document.getElementById('aithor-close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        chatWindow.style.display = 'none';
        bubble.style.transform = 'scale(1)';
      });

      // Close button hover effect
      document.getElementById('aithor-close-btn').addEventListener('mouseenter', function() {
        this.style.background = 'rgba(255,255,255,0.3)';
      });
      document.getElementById('aithor-close-btn').addEventListener('mouseleave', function() {
        this.style.background = 'rgba(255,255,255,0.2)';
      });
    })();
  `;

    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
};

// @desc    Handle Meta Data Deletion Callback
// @route   POST /api/integrations/meta/data-deletion
// @access  Public
const metaDataDeletion = (req, res) => {
    try {
        // In a real app, you would parse the signed_request to verify the user
        // and delete their data from your database.
        // For now, we just return the confirmation code as required by FB.

        const confirmationCode = 'del_' + Date.now(); // Generate a dummy code

        const response = {
            url: `${BASE_URL}/data-deletion-status?code=${confirmationCode}`,
            confirmation_code: confirmationCode,
        };

        res.json(response);
    } catch (error) {
        console.error('Data Deletion Error:', error);
        res.status(500).send('Error processing data deletion request');
    }
};

export {
    metaLogin,
    metaCallback,
    shopifyLogin,
    shopifyCallback,
    metaWebhook,
    shopifyWebhook,
    getWidgetScript,
    metaDataDeletion
};
