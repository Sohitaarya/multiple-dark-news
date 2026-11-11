export default {
  async fetch(request, env) {
    try {
      if (env.ASSETS) {
        let response = await env.ASSETS.fetch(request);
        if (response.status === 404) {
          const indexReq = new Request(new URL('/index.html', request.url), request);
          return await env.ASSETS.fetch(indexReq);
        }
        return response;
      }
    } catch (e) {
      // fallback
    }
    return new Response("Loading...", { status: 200 });
  }
};
