// Webhook receiver for screenshot updates
// This can be deployed as a serverless function (Vercel/Netlify/Cloudflare Workers)

import { generateAllScreenshots } from './generate-screenshots.js';

// Configuration for webhook security
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const ALLOWED_DOMAINS = [
    'hyprl.projectpile.tech',
    'manpreet.tech', 
    'projectpile.tech',
    'notehole.projectpile.tech'
];

/**
 * Webhook handler for screenshot updates
 * Supports multiple webhook sources (GitHub, custom deployment hooks, etc.)
 */
export async function handleWebhook(request) {
    try {
        // Verify webhook authenticity
        if (!verifyWebhookSignature(request)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized webhook' })
            };
        }

        const body = await parseRequestBody(request);
        const source = detectWebhookSource(request, body);
        
        console.log(`📥 Webhook received from ${source}`);
        
        // Determine if screenshots should be updated
        const shouldUpdate = await shouldUpdateScreenshots(body, source);
        
        if (!shouldUpdate) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Webhook processed, no screenshot update needed',
                    source 
                })
            };
        }

        // Generate screenshots
        console.log('🚀 Triggering screenshot update...');
        const result = await generateAllScreenshots();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Screenshots updated successfully',
                source,
                result: {
                    successful: result.successful,
                    failed: result.failed,
                    total: result.total
                }
            })
        };
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
}

/**
 * Verify webhook signature (implement based on your webhook provider)
 */
function verifyWebhookSignature(request) {
    // For GitHub webhooks, verify HMAC signature
    const signature = request.headers['x-hub-signature-256'];
    const secret = request.headers['x-webhook-secret'];
    
    // Simple secret verification (implement proper HMAC for production)
    if (secret && secret === WEBHOOK_SECRET) {
        return true;
    }
    
    // For development, allow requests with correct query param
    const url = new URL(request.url);
    if (url.searchParams.get('secret') === WEBHOOK_SECRET) {
        return true;
    }
    
    return false;
}

/**
 * Parse request body based on content type
 */
async function parseRequestBody(request) {
    const contentType = request.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
        return await request.json();
    }
    
    return await request.text();
}

/**
 * Detect the source of the webhook
 */
function detectWebhookSource(request, body) {
    // GitHub webhook
    if (request.headers['x-github-event']) {
        return 'github';
    }
    
    // Vercel deployment webhook
    if (request.headers['x-vercel-signature']) {
        return 'vercel';
    }
    
    // Netlify webhook
    if (request.headers['x-netlify-event']) {
        return 'netlify';
    }
    
    // Custom webhook
    if (body && typeof body === 'object' && body.source) {
        return body.source;
    }
    
    return 'unknown';
}

/**
 * Determine if screenshots should be updated based on webhook payload
 */
async function shouldUpdateScreenshots(body, source) {
    switch (source) {
        case 'github':
            // Update on push to main branch or release
            return body.ref === 'refs/heads/main' || body.ref === 'refs/heads/master';
            
        case 'vercel':
        case 'netlify':
            // Update on successful deployment
            return body.state === 'ready' || body.state === 'success';
            
        case 'custom':
            // Check if any of our domains are mentioned
            const payload = JSON.stringify(body).toLowerCase();
            return ALLOWED_DOMAINS.some(domain => payload.includes(domain));
            
        default:
            // Default to updating for unknown sources
            return true;
    }
}

// For testing purposes
export async function testWebhook() {
    console.log('🧪 Testing webhook functionality...');
    
    const mockRequest = {
        url: `http://localhost:3000/webhook?secret=${WEBHOOK_SECRET}`,
        headers: {
            'content-type': 'application/json'
        },
        json: () => Promise.resolve({ source: 'test', domains: ALLOWED_DOMAINS })
    };
    
    return await handleWebhook(mockRequest);
}

// For Vercel serverless functions
export default async function handler(req, res) {
    const result = await handleWebhook(req);
    res.status(result.statusCode).json(JSON.parse(result.body));
}

// Manual trigger for testing
if (import.meta.url === `file://${process.argv[1]}`) {
    testWebhook()
        .then(result => {
            console.log('Test result:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Test failed:', error);
            process.exit(1);
        });
}
