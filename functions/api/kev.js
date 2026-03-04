// Cloudflare Pages Function — proxies CISA KEV feed with caching
export async function onRequest(context) {
  const cache = caches.default;
  const cacheKey = new Request('https://cisa-kev-cache.sycamore-systems.com/kev');

  // Check cache first (6 hour TTL)
  let cached = await cache.match(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
    { headers: { 'User-Agent': 'Sycamore-Systems-ThreatDashboard/1.0' } }
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
