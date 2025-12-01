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

    const script = `
    (function() {
      const companyId = "${companyId}";
      if (!companyId) return;

      // Create Chat Bubble
      const bubble = document.createElement('div');
      bubble.style.position = 'fixed';
      bubble.style.bottom = '20px';
      bubble.style.right = '20px';
      bubble.style.width = '60px';
      bubble.style.height = '60px';
      bubble.style.backgroundColor = '#0084FF';
      bubble.style.borderRadius = '50%';
      bubble.style.cursor = 'pointer';
      bubble.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      bubble.style.display = 'flex';
      bubble.style.alignItems = 'center';
      bubble.style.justifyContent = 'center';
      bubble.style.zIndex = '9999';
      bubble.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
      
      // Create Chat Window (Hidden by default)
      const chatWindow = document.createElement('div');
      chatWindow.style.position = 'fixed';
      chatWindow.style.bottom = '90px';
      chatWindow.style.right = '20px';
      chatWindow.style.width = '350px';
      chatWindow.style.height = '500px';
      chatWindow.style.backgroundColor = 'white';
      chatWindow.style.borderRadius = '12px';
      chatWindow.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
      chatWindow.style.display = 'none';
      chatWindow.style.flexDirection = 'column';
      chatWindow.style.zIndex = '9999';
      chatWindow.style.overflow = 'hidden';
      
      // Header
      const header = document.createElement('div');
      header.style.padding = '15px';
      header.style.backgroundColor = '#0084FF';
      header.style.color = 'white';
      header.style.fontWeight = 'bold';
      header.innerText = 'Chat with us';
      chatWindow.appendChild(header);

      // Body (Iframe to your chat interface or simple div)
      const body = document.createElement('div');
      body.style.flex = '1';
      body.style.padding = '15px';
      body.innerHTML = '<p style="color: #666;">Hello! How can I help you today?</p>';
      chatWindow.appendChild(body);

      document.body.appendChild(bubble);
      document.body.appendChild(chatWindow);

      bubble.addEventListener('click', () => {
        if (chatWindow.style.display === 'none') {
          chatWindow.style.display = 'flex';
        } else {
          chatWindow.style.display = 'none';
        }
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
