export async function onRequestGet() {
  return new Response(JSON.stringify({
    authenticated: false,
    message: 'Auth status endpoint running'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
