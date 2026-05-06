// /edge-functions/[[default]].js
// ONE FILE TO HANDLE ALL ROUTES

// Helper for JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle OPTIONS (CORS preflight)
export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

// Handle POST requests
export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // SIGNUP
  if (pathname === '/auth/signup') {
    try {
      const body = await context.request.json();
      console.log('[SIGNUP]', body.email);
      
      // Mock response for now (bypass MongoDB)
      return jsonResponse({ success: true, message: 'User created' }, 201);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
  
  // LOGIN
  if (pathname === '/auth/login') {
    try {
      const body = await context.request.json();
      console.log('[LOGIN]', body.email);
      
      return jsonResponse({ success: true, email: body.email }, 200);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
  
  // QR CODE SAVE
  if (pathname === '/qrcodes' || pathname === '/api/qrcodes') {
    try {
      const body = await context.request.json();
      console.log('[QR SAVE]', body.id);
      
      return jsonResponse({ success: true }, 200);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
  
  return jsonResponse({ error: 'Not found' }, 404);
}

// Handle GET requests
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Auth status
  if (pathname === '/auth/status') {
    return jsonResponse({ authenticated: false });
  }
  
  // Test endpoint
  if (pathname === '/auth/test') {
    return jsonResponse({ status: 'ok', message: 'Function is working' });
  }
  
  // Tracking redirect
  if (pathname.startsWith('/track/')) {
    const id = pathname.split('/')[2];
    // Mock redirect - will redirect to Google for testing
    return Response.redirect('https://www.google.com', 302);
  }
  
  // Serve static frontend for all other paths
  return context.next();
}

// Handle PUT (same as POST)
export async function onRequestPut(context) {
  return onRequestPost(context);
}

// Default handler
export default async function onRequest(context) {
  const method = context.request.method;
  if (method === 'GET') return onRequestGet(context);
  if (method === 'POST') return onRequestPost(context);
  if (method === 'PUT') return onRequestPut(context);
  if (method === 'OPTIONS') return onRequestOptions();
  return context.next();
}
