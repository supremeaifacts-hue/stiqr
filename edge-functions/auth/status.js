// ✅ CORRECT - Use onRequestGet for GET requests
export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    authenticated: false,
    message: 'Auth function working'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
