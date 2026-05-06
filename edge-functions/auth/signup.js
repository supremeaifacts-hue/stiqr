// /edge-functions/auth/signup.js
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password, name } = body;
    
    // Mock response for now
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User created',
      email: email 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
