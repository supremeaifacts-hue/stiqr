// /edge-functions/qrcodes.js
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { id, data } = body;
    
    // Mock response for now
    return new Response(JSON.stringify({ success: true, id: id }), {
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

// Handle PUT as well (same as POST)
export async function onRequestPut(context) {
  return onRequestPost(context);
}
