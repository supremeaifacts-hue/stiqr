// /functions/auth/[[default]].js
// This handles ALL requests to /auth/*

// Helper for JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Handle POST /auth/login and /auth/signup
export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  try {
    const body = await context.request.json();
    
    // Handle login - proxy to backend API with manual redirect handling
    if (pathname === '/auth/login') {
      const { email, password } = body;

      // Fetch the backend API with 'manual' redirect to capture Set-Cookie headers
      const backendResponse = await fetch('https://www.stiqr.top/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        redirect: 'manual'
      });

      // Get the Set-Cookie header from the backend response
      const setCookieHeader = backendResponse.headers.get('set-cookie');

      // Create the final response for the browser
      const clientResponse = new Response(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText
      });

      // If a Set-Cookie header exists, manually add it to the browser response
      if (setCookieHeader) {
        clientResponse.headers.set('Set-Cookie', setCookieHeader);
      }

      return clientResponse;
    }
    
    // Handle signup - proxy to backend API with manual redirect handling
    if (pathname === '/auth/signup') {
      const { email, password, displayName } = body;

      // Fetch the backend API with 'manual' redirect to capture Set-Cookie headers
      const backendResponse = await fetch('https://www.stiqr.top/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
        redirect: 'manual'
      });

      // Get the Set-Cookie header from the backend response
      const setCookieHeader = backendResponse.headers.get('set-cookie');

      // Create the final response for the browser
      const clientResponse = new Response(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText
      });

      // If a Set-Cookie header exists, manually add it to the browser response
      if (setCookieHeader) {
        clientResponse.headers.set('Set-Cookie', setCookieHeader);
      }

      return clientResponse;
    }
    
    return jsonResponse({ error: 'Not found' }, 404);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

// Handle GET /auth/status
export async function onRequestGet(context) {
  return jsonResponse({ authenticated: false });
}
