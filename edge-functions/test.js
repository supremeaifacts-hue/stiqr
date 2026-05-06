// /edge-functions/test.js
export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'Edge Function is working!' 
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
