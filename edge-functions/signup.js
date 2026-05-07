// ✅ CORRECT - This MUST be the export for a POST endpoint
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password, name } = body;
    
    // Your logic here...
    
    return new Response(JSON.stringify({ success: true }), {
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