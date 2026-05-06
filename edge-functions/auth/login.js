// ✅ CORRECT - Use onRequestPost for POST requests
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password } = body;
    
    console.log('Login attempt:', email);
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Mock response (accept any credentials for now)
    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        email: email,
        name: email.split('@')[0],
        subscriptionStatus: 'free'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET requests to this endpoint (return 405)
export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
