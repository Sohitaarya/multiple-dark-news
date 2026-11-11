export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Attempt to fetch static asset from Cloudflare Pages storage
    let response = await env.ASSETS.fetch(request);

    // If 404 and request is not for a static asset file (like .js, .css, .png, .xml, .json)
    if (response.status === 404 && !url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|xml|json|txt|woff2?|ttf|eot)$/i)) {
      // Rewrite to index.html with 200 status for SPA routing
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    return response;
  }
};
