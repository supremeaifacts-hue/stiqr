// worker.js
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Your backend URL - change this to your deployed backend
    const BACKEND_URL = 'https://your-backend.onrender.com';

    // Forward the request to your backend
    const url = new URL(request.url);
    const backendUrl = BACKEND_URL + url.pathname + url.search;

    const forwardRequest = new Request(backendUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    const response = await fetch(forwardRequest);

    // Return response with CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  },
};
