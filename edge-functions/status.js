// ✅ CORRECT - This MUST be the export for a GET endpoint
export function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    authenticated: false,
    message: 'Auth function working',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
