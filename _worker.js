const OTX_KEY = '1e6d0121df63f01a5bad26056a8fd7bff07907d27b187a5fc036a25c35f2b95b';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=21600',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Route: /api/kev
    if (url.pathname === '/api/kev') {
      const cache = caches.default;
      const cacheKey = new Request('https://cache.internal/kev');
      let cached = await cache.match(cacheKey);
      if (cached) return cached;

      const res = await fetch(
        'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
        { headers: { 'User-Agent': 'Sycamore-Systems/1.0' } }
      );
      const data = await res.text();
      const response = new Response(data, { headers: CORS });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    // Route: /api/otx
    if (url.pathname === '/api/otx') {
      const cache = caches.default;
      const cacheKey = new Request('https://cache.internal/otx');
      let cached = await cache.match(cacheKey);
      if (cached) return cached;

      const res = await fetch(
        'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=10&page=1',
        { headers: { 'X-OTX-API-KEY': OTX_KEY } }
      );
      const data = await res.text();
      const response = new Response(data, { headers: CORS });
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }

    // All other requests — serve static assets
    return env.ASSETS.fetch(request);
  },
};
