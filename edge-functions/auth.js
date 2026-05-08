// Edge auth proxy handling all /auth/* requests and forwarding them to a backend API.

const BACKEND_URL = process.env.BACKEND_URL;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function errorResponse(message, status = 500) {
  return jsonResponse({ error: message }, status);
}

export async function onRequest(context) {
  if (!BACKEND_URL) {
    return errorResponse('BACKEND_URL environment variable not configured', 500);
  }

  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const method = context.request.method;

  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const backendUrl = new URL(pathname, BACKEND_URL).toString();

  try {
    const requestInit = {
      method,
      headers: {
        'Content-Type': context.request.headers.get('Content-Type') || 'application/json'
      }
    };

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      requestInit.body = await context.request.text();
    }

    const backendResponse = await fetch(backendUrl, requestInit);
    const responseText = await backendResponse.text();

    const headers = new Headers(backendResponse.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return new Response(responseText, {
      status: backendResponse.status,
      headers
    });
  } catch (error) {
    return errorResponse(error.message, 502);
  }
}
