import { onRequestPost as signupPost } from './signup.js';
import { onRequestPost as loginPost } from './login.js';
import { onRequestGet as statusGet } from './status.js';
import { onRequestGet as meGet } from './me.js';

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const getAuthPath = (context) => {
  const url = new URL(context.request.url);
  return url.pathname.replace(/^\/auth/, '') || '/';
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequestPost(context) {
  const path = getAuthPath(context);
  if (path === '/signup') return signupPost(context);
  if (path === '/login') return loginPost(context);

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: jsonHeaders
  });
}

export async function onRequestGet(context) {
  const path = getAuthPath(context);
  if (path === '/status') return statusGet(context);
  if (path === '/me') return meGet(context);

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: jsonHeaders
  });
}
