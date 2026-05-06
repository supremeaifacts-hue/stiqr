// /edge-functions/track/[id].js
export async function onRequestGet(context) {
  const id = context.params.id;
  
  // Mock redirect - will redirect to Google for testing
  return Response.redirect('https://www.google.com', 302);
}
