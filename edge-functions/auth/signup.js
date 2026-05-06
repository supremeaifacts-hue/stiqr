// ✅ CORRECT - Use onRequestPost for POST requests
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password, name } = body;
    
    console.log('Signup attempt:', email);
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Mock response (bypass database for now)
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User created successfully',
      email: email,
      name: name || email.split('@')[0]
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
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
