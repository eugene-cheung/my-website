/**
 * Sends one beacon per visit to the analytics Worker.
 *
 * The payload is gathered over the life of the visit (which sections were
 * actually read, how long they stayed) and flushed once when the page is
 * hidden, so a visit costs a single request.
 */

const ENDPOINT = import.meta.env.VITE_ANALYTICS_URL;

export function initAnalytics() {
  if (!ENDPOINT) return;                       // no endpoint configured — stay silent
  if (navigator.doNotTrack === '1') return;    // honor DNT

  const start = Date.now();
  const sections = new Set();
  let sent = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.target.id) sections.add(e.target.id);
      }
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));

  // The résumé modal is the strongest signal of real interest, so flag it.
  let resumeOpened = false;
  document.addEventListener(
    'click',
    (e) => {
      const el = e.target.closest?.('a[href*="resume"], [data-resume]');
      if (el) resumeOpened = true;
    },
    true
  );

  const flush = () => {
    if (sent) return;
    sent = true;
    const payload = JSON.stringify({
      path: location.pathname + location.hash,
      referrer: document.referrer || null,
      utm: location.search || null,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      sections: [...sections],
      dwellMs: Date.now() - start,
      resumeOpened,
    });

    // sendBeacon survives the page unloading; fetch is the fallback.
    const blob = new Blob([payload], { type: 'application/json' });
    if (!navigator.sendBeacon?.(`${ENDPOINT}/collect`, blob)) {
      fetch(`${ENDPOINT}/collect`, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  };

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  addEventListener('pagehide', flush);
  // Backstop for visits that never fire either event (kept tab, crash).
  setTimeout(flush, 90_000);
}
