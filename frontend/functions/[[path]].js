// frontend/functions/[[path]].js
export function onRequest(context) {
  // For all requests that aren't static assets,
  // serve the index.html (for React Router)
  return context.next();
}
