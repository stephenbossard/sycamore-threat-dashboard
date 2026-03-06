// Cloudflare Pages Function — proxies AlienVault OTX with caching
const OTX_KEY = process.env.OTX_API_KEY || '';

export async function onRequest(context) {
  const cache = caches.default;
  const cacheKey = new Request('https://otx-cache.sycamore-systems.com/pulses');

  let cached = await cache.match(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    'https://otx.alienvault.com/api/v1/pulses/subscribed?limit=10&page=1',
    { headers: { 'X-OTX-API-KEY': OTX_KEY } }
  );

  const data = await res.json();
  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=21600',
    },
  });

  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
