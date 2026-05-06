// /edge-functions/auth/status.js
export async function onRequestGet() {
  return new Response(JSON.stringify({ authenticated: false }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
