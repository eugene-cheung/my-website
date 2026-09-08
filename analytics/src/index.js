/**
 * Visitor analytics for cheunge.dev.
 *
 * POST /collect    — called by the site; one row per visit.
 * GET  /dashboard  — private HTML view (requires ?key=<DASH_KEY>).
 * GET  /stats      — same data as JSON (requires ?key=<DASH_KEY>).
 *
 * Cloudflare fills in geo and network fields on `request.cf` for free, so
 * there is no third-party lookup and no per-request cost.
 */

const ALLOWED_ORIGINS = new Set([
  'https://cheunge.dev',
  'https://www.cheunge.dev',
  'http://localhost:5173',
]);

const BOT_RE = /bot|crawler|spider|crawling|headless|preview|slurp|lighthouse|curl|wget|monitor/i;

function cors(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://cheunge.dev';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/** Stable per-visitor id that rotates daily, so repeat views on one day
 *  collapse into one visitor without setting a cookie. */
async function visitorHash(ip, ua, salt) {
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${ip}|${ua}|${day}|${salt}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function deviceOf(ua = '') {
  if (/iPad|Tablet/i.test(ua)) return 'tablet';
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile';
  return 'desktop';
}

const str = (v, max = 512) => (typeof v === 'string' ? v.slice(0, max) : null);

async function collect(request, env) {
  // Anyone can POST to a public endpoint. Beacons are cross-origin, so browsers
  // always attach Origin; reject a wrong one, but allow it missing rather than
  // dropping real visits from clients that strip the header.
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return new Response(null, { status: 403 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // Beacons occasionally arrive without a parseable body; still worth a row.
  }

  const cf = request.cf || {};
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('cf-connecting-ip') || '';
  const salt = env.HASH_SALT || 'cheunge';

  // A visit can beacon more than once (see the client's flush()). Keyed on
  // visit_id, later beacons refine the same row: the section list and dwell
  // time grow, and the original timestamp is kept.
  await env.DB.prepare(
    `INSERT INTO views (visit_id, ts, visitor, ip, country, region, city, timezone, asn, org,
                        referrer, utm, path, user_agent, device, screen, language,
                        sections, dwell_ms, resume_opened, is_bot)
     VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21)
     ON CONFLICT(visit_id) DO UPDATE SET
       sections      = excluded.sections,
       dwell_ms      = MAX(COALESCE(views.dwell_ms, 0), COALESCE(excluded.dwell_ms, 0)),
       resume_opened = MAX(views.resume_opened, excluded.resume_opened),
       path          = excluded.path`
  )
    .bind(
      str(body.visitId, 64) || crypto.randomUUID(),
      new Date().toISOString(),
      await visitorHash(ip, ua, salt),
      ip,
      cf.country ?? null,
      cf.region ?? null,
      cf.city ?? null,
      cf.timezone ?? null,
      cf.asn ?? null,
      cf.asOrganization ?? null,
      str(body.referrer) || request.headers.get('referer'),
      str(body.utm, 256),
      str(body.path, 256),
      ua.slice(0, 512),
      deviceOf(ua),
      str(body.screen, 32),
      str(body.language, 32),
      str(Array.isArray(body.sections) ? body.sections.join(',') : body.sections, 256),
      Number.isFinite(body.dwellMs) ? Math.round(body.dwellMs) : null,
      body.resumeOpened ? 1 : 0,
      BOT_RE.test(ua) ? 1 : 0
    )
    .run();

  return new Response(null, { status: 204, headers: cors(request.headers.get('origin')) });
}

async function stats(env) {
  const q = (sql) => env.DB.prepare(sql).all().then((r) => r.results);
  const [recent, byOrg, byRef, byCity, daily, totals] = await Promise.all([
    q(`SELECT ts, city, region, country, org, ip, referrer, device, path, sections, dwell_ms, resume_opened
       FROM views WHERE is_bot = 0 ORDER BY ts DESC LIMIT 100`),
    q(`SELECT org, COUNT(*) n, COUNT(DISTINCT visitor) people, MAX(ts) last
       FROM views WHERE is_bot = 0 AND org IS NOT NULL
       GROUP BY org ORDER BY n DESC LIMIT 25`),
    q(`SELECT referrer, COUNT(*) n FROM views
       WHERE is_bot = 0 AND referrer IS NOT NULL AND referrer != ''
       GROUP BY referrer ORDER BY n DESC LIMIT 25`),
    q(`SELECT city, region, country, COUNT(*) n, COUNT(DISTINCT visitor) people
       FROM views WHERE is_bot = 0 AND city IS NOT NULL
       GROUP BY city, region, country ORDER BY n DESC LIMIT 25`),
    q(`SELECT substr(ts,1,10) day, COUNT(*) views, COUNT(DISTINCT visitor) visitors
       FROM views WHERE is_bot = 0 GROUP BY day ORDER BY day DESC LIMIT 30`),
    q(`SELECT COUNT(*) views, COUNT(DISTINCT visitor) visitors,
              SUM(resume_opened) resume_opens,
              ROUND(AVG(NULLIF(dwell_ms,0))/1000.0, 1) avg_seconds
       FROM views WHERE is_bot = 0`),
  ]);
  return { totals: totals[0], daily, byOrg, byCity, byRef, recent };
}

const esc = (s) =>
  String(s ?? '—').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function dashboard(d) {
  const t = d.totals || {};
  const rows = (arr, cells) => arr.map((r) => `<tr>${cells(r).map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  const when = (ts) => (ts ? new Date(ts).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) : '—');

  return `<!doctype html><html><head><meta charset="utf-8">
<title>cheunge.dev — visitors</title>
<meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; margin: 0; padding: 32px; background: #faf8f2; color: #22301f; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; color: #2f6b45; margin: 32px 0 8px; }
  .sub { color: #6b7280; margin: 0 0 24px; }
  .cards { display: flex; gap: 12px; flex-wrap: wrap; }
  .card { background: #fff; border: 1px solid #e5e2d8; border-radius: 10px; padding: 14px 18px; min-width: 130px; }
  .card b { display: block; font-size: 26px; font-weight: 600; }
  .card span { font-size: 12px; color: #6b7280; }
  .scroll { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; background: #fff; border: 1px solid #e5e2d8; border-radius: 10px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #f0ede4; white-space: nowrap; font-variant-numeric: tabular-nums; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: #6b7280; }
  tr:last-child td { border-bottom: 0; }
  @media (prefers-color-scheme: dark) {
    body { background: #14180f; color: #e8e6dd; }
    .card, table { background: #1c2117; border-color: #2c3325; }
    th, td { border-color: #242a1e; }
  }
</style></head><body>
<h1>cheunge.dev — visitors</h1>
<p class="sub">Times in Pacific. Bots excluded.</p>
<div class="cards">
  <div class="card"><b>${esc(t.visitors)}</b><span>unique visitors</span></div>
  <div class="card"><b>${esc(t.views)}</b><span>views</span></div>
  <div class="card"><b>${esc(t.resume_opens)}</b><span>résumé opens</span></div>
  <div class="card"><b>${esc(t.avg_seconds)}s</b><span>avg time on page</span></div>
</div>

<h2>Networks — the closest thing to "who"</h2>
<div class="scroll"><table><tr><th>Organization</th><th>Visitors</th><th>Views</th><th>Last seen</th></tr>
${rows(d.byOrg, (r) => [r.org, r.people, r.n, when(r.last)])}</table></div>

<h2>Where from</h2>
<div class="scroll"><table><tr><th>City</th><th>Region</th><th>Country</th><th>Visitors</th><th>Views</th></tr>
${rows(d.byCity, (r) => [r.city, r.region, r.country, r.people, r.n])}</table></div>

<h2>Referrers</h2>
<div class="scroll"><table><tr><th>Source</th><th>Views</th></tr>
${rows(d.byRef, (r) => [r.referrer, r.n])}</table></div>

<h2>Daily</h2>
<div class="scroll"><table><tr><th>Day</th><th>Visitors</th><th>Views</th></tr>
${rows(d.daily, (r) => [r.day, r.visitors, r.views])}</table></div>

<h2>Recent visits</h2>
<div class="scroll"><table><tr><th>When</th><th>City</th><th>Org</th><th>IP</th><th>Referrer</th><th>Device</th><th>Sections read</th><th>Time</th><th>Résumé</th></tr>
${rows(d.recent, (r) => [
    when(r.ts), [r.city, r.country].filter(Boolean).join(', '), r.org, r.ip, r.referrer,
    r.device, r.sections, r.dwell_ms ? Math.round(r.dwell_ms / 1000) + 's' : '—',
    r.resume_opened ? 'yes' : '',
  ])}</table></div>
</body></html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    if (url.pathname === '/collect' && request.method === 'POST') return collect(request, env);

    const authed = env.DASH_KEY && url.searchParams.get('key') === env.DASH_KEY;
    if (url.pathname === '/stats') {
      if (!authed) return new Response('nope', { status: 401 });
      return Response.json(await stats(env));
    }
    if (url.pathname === '/dashboard') {
      if (!authed) return new Response('nope', { status: 401 });
      return new Response(dashboard(await stats(env)), {
        headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' },
      });
    }
    return new Response('ok');
  },
};
