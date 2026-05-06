// /edge-functions/auth/login.js
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password } = body;
    
    // Mock response for now
    return new Response(JSON.stringify({ 
      success: true, 
      email: email 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
