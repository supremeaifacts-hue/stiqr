// Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Forward API requests to your Render backend
    if (pathname.startsWith('/auth/') ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/track/')) {
      
      const backendUrl = `https://stiqr-backend.onrender.com${pathname}${url.search}`;
      const backendRequest = new Request(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      return fetch(backendRequest);
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
