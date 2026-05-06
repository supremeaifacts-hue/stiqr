// /edge-functions/auth/login.js
export async function onRequest(context) {
  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await context.request.json();
    const { email, password } = body;
    
    console.log('Login attempt for:', email);
    
    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // TODO: Add database check here later
    // For now, mock response - accept any email/password
    
    // Mock success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Login successful',
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
