// /functions/[[default]].js
// This file catches ALL requests to www.stiqr.top

// Helper function to send JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle POST requests (login, signup, QR code saving)
export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  try {
    const body = await context.request.json();
    
    // Handle login
    if (pathname === '/auth/login') {
      // Your login logic here (check email/password in MongoDB)
      return jsonResponse({ success: true, message: 'Login successful' });
    }
    
    // Handle signup
    if (pathname === '/auth/signup') {
      // Your signup logic here (save user to MongoDB)
      return jsonResponse({ success: true, message: 'Signup successful' });
    }
    
    // Handle QR code saving
    if (pathname === '/api/qrcodes' || pathname === '/qrcodes') {
      const { id, data } = body;
      
      if (!id || !data) {
        return jsonResponse({ error: 'Missing id or data' }, 400);
      }
      
      // Save to KV storage
      await context.env.QR_KV.put(id, data);
      
      return jsonResponse({ success: true, id: id });
    }
    
    return jsonResponse({ error: 'Not found' }, 404);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

// Handle GET requests (auth status, tracking)
export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Handle auth status check
  if (pathname === '/auth/status') {
    // Check if user is logged in (from JWT token or session)
    return jsonResponse({ authenticated: false });
  }
  
  // Handle QR code tracking redirect
  if (pathname.startsWith('/track/')) {
    const id = pathname.split('/')[2];
    const destination = await context.env.QR_KV.get(id);
    
    if (!destination) {
      return new Response('QR Code Not Found', { status: 404 });
    }
    
    // Redirect to the destination URL
    return Response.redirect(destination, 302);
  }
  
  // For all other paths (like your homepage, dashboard, etc.), serve the static frontend
  return context.next();
}

// Handle PUT requests (alternative for QR code saving)
export async function onRequestPut(context) {
  const url = new URL(context.request.url);
  
  if (url.pathname === '/qrcodes' || url.pathname === '/api/qrcodes') {
    try {
      const body = await context.request.json();
      const { id, data } = body;
      
      if (!id || !data) {
        return jsonResponse({ error: 'Missing id or data' }, 400);
      }
      
      await context.env.QR_KV.put(id, data);
      return jsonResponse({ success: true, id: id });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }
  
  return jsonResponse({ error: 'Not found' }, 404);
}

// Handle OPTIONS requests (for CORS)
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}