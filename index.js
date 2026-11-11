export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        return env.ASSETS.fetch(new URL('/index.html', request.url));
      }
      return response;
    }
    return new Response("MultipleDarkNews Tools Engine Ready", { status: 200 });
  }
};
