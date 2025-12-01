import express from 'express';
import {
    metaLogin,
    metaCallback,
    shopifyLogin,
    shopifyCallback,
    metaWebhook,
    shopifyWebhook,
    getWidgetScript,
    metaDataDeletion
} from '../controllers/integrationController.js';

const router = express.Router();

// Meta (Facebook/Instagram/WhatsApp) Auth
router.get('/meta/login', metaLogin);
router.get('/meta/callback', metaCallback);
router.post('/meta/data-deletion', metaDataDeletion);
router.get('/meta/data-deletion', metaDataDeletion); // For Facebook verification

// Shopify Auth
router.get('/shopify/login', shopifyLogin);
router.get('/shopify/callback', shopifyCallback);

// Webhooks
router.post('/webhooks/meta', metaWebhook);
router.get('/webhooks/meta', metaWebhook); // For verification
router.post('/webhooks/shopify', shopifyWebhook);

// No-Code Widget
router.get('/widget/script.js', getWidgetScript);

export default router;
