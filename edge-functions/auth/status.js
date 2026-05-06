export function onRequest(context) {
  return new Response(JSON.stringify({ 
    authenticated: false,
    message: 'Auth function working'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
