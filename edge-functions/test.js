export function onRequest(context) {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'Edge Function is working!',
    url: context.request.url
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
