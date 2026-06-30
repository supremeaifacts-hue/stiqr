// Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle KV update requests (called by backend PUT /api/qrcodes/:id)
    if (pathname === '/api/kv/update' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { key, value } = body;
        
        if (!key) {
          return new Response(JSON.stringify({ error: 'Key is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        await env.QR_DESTINATIONS.put(key, value);
        console.log(`✅ KV updated: ${key} -> ${value}`);
        
        return new Response(JSON.stringify({ success: true, key }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(`❌ KV update error: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle KV delete requests (called by backend DELETE /api/assets/qrcodes/:id)
    if (pathname === '/api/kv/delete' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { key } = body;
        
        if (!key) {
          return new Response(JSON.stringify({ error: 'Key is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        await env.QR_DESTINATIONS.delete(key);
        console.log(`✅ KV deleted: ${key}`);
        
        return new Response(JSON.stringify({ success: true, key }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error(`❌ KV delete error: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ============================================================
    // SOCIAL LANDING PAGES
    // ============================================================
    if (pathname.startsWith('/social/')) {
      const socialId = pathname.substring(8);
      console.log(`🔗 Social page request: ${socialId}`);
      
      // Forward to Render backend - use /social/ not /api/social/
      const backendUrl = `https://stiqr-backend.onrender.com/social/${socialId}`;
      const backendRequest = new Request(backendUrl, {
        method: 'GET',
        headers: request.headers,
      });
      
      try {
        const response = await fetch(backendRequest);
        console.log(`✅ Social page response: ${response.status}`);
        return response;
      } catch (error) {
        console.error(`❌ Social page error: ${error.message}`);
        return new Response('Social page not found', { status: 404 });
      }
    }
    
    // ============================================================
    // EVENT LANDING PAGES
    // ============================================================
    if (pathname.startsWith('/event/')) {
      const eventId = pathname.substring(7);
      console.log(`🎉 Event page request: ${eventId}`);
      
      // Forward to Render backend - use /event/ not /api/event/
      const backendUrl = `https://stiqr-backend.onrender.com/event/${eventId}`;
      const backendRequest = new Request(backendUrl, {
        method: 'GET',
        headers: request.headers,
      });
      
      try {
        const response = await fetch(backendRequest);
        console.log(`✅ Event page response: ${response.status}`);
        return response;
      } catch (error) {
        console.error(`❌ Event page error: ${error.message}`);
        return new Response('Event page not found', { status: 404 });
      }
    }
    
    // ============================================================
    // PDF ROUTES - Forward to Render backend
    // ============================================================
    if (pathname.startsWith('/api/pdf/')) {
      const pdfId = pathname.substring(9);
      const backendUrl = `https://stiqr-backend.onrender.com/api/pdf/${pdfId}`;
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      try {
        const response = await fetch(backendRequest);
        console.log(`✅ PDF route response: ${response.status}`);
        return response;
      } catch (error) {
        console.error(`❌ PDF route error: ${error.message}`);
        return new Response('PDF not found', { status: 404 });
      }
    }
    
    // ============================================================
    // API, AUTH, TRACKING - Forward to Render backend
    // ============================================================
    if (pathname.startsWith('/auth/') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/track/')) {
      
      const backendUrl = `https://stiqr-backend.onrender.com${pathname}${url.search}`;
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      const response = await fetch(backendRequest);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      newResponse.headers.set('Pragma', 'no-cache');
      newResponse.headers.set('Expires', '0');
      return newResponse;
    }

    // 2. For all other requests (like /, /dashboard, /pricing), serve your Cloudflare Pages site
    const pageUrl = `https://stiqr-frontend.pages.dev${pathname}${url.search}`;
    const pageRequest = new Request(pageUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return fetch(pageRequest);
  },
};
