// EdgeOne Pages Function: /track/:id
// This function handles QR code scan tracking by proxying to the backend.
// It records the scan and redirects the user to the destination URL.

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://stiqr-backend.onrender.com';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const id = url.pathname.split('/track/')[1] || '';
  
  if (!id) {
    return new Response('Missing QR code ID', { status: 400 });
  }
  
  console.log(`🔍 EdgeOne track function called for QR: ${id}`);
  
  try {
    // Forward the request to the backend tracking endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/track/${id}`, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || '',
        'X-Forwarded-For': request.headers.get('X-Forwarded-For') || request.headers.get('CF-Connecting-IP') || '',
      },
      redirect: 'manual', // Don't follow redirects, we'll handle them
    });
    
    // If the backend returns a redirect, follow it
    if (backendResponse.status >= 300 && backendResponse.status < 400) {
      const location = backendResponse.headers.get('Location');
      if (location) {
        return Response.redirect(location, 302);
      }
    }
    
    // If the backend returns a successful response, return it
    if (backendResponse.ok) {
      return new Response(backendResponse.body, {
        status: backendResponse.status,
        headers: backendResponse.headers,
      });
    }
    
    // If backend returns 404, try to find the QR code data from the API
    if (backendResponse.status === 404) {
      // Try to get the QR code data from the assets API
      const qrResponse = await fetch(`${BACKEND_URL}/api/assets/qrcodes/${id}`, {
        headers: {
          'User-Agent': request.headers.get('User-Agent') || '',
        },
      });
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        if (qrData.data) {
          let redirectUrl = qrData.data;
          if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
            redirectUrl = 'https://' + redirectUrl;
          }
          return Response.redirect(redirectUrl, 302);
        }
      }
    }
    
    // Fallback: return the backend response as-is
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        'content-type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in track function:', error);
    return new Response('Tracking service unavailable', { status: 502 });
  }
}
