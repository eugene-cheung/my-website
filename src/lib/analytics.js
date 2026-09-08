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
  const visitId = crypto.randomUUID();
  let lastSent = '';

  // A section counts as "read" once a meaningful amount of it is on screen.
  // Sections here run several viewports tall, so a plain ratio threshold can
  // never be reached by the tall ones (a 4000px section in a 900px viewport
  // peaks at ~0.22). Accept EITHER a decent ratio, for short sections, OR
  // half a viewport of visible height, for long ones.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || !e.target.id) continue;
        const enough =
          e.intersectionRatio >= 0.4 ||
          e.intersectionRect.height >= window.innerHeight * 0.5;
        if (enough) sections.add(e.target.id);
      }
    },
    { threshold: [0, 0.1, 0.25, 0.4, 0.75, 1] }
  );

  // This module loads before React paints, so the sections do not exist yet.
  // Retry each frame until they appear, then stop (and give up after ~5s so a
  // markup change can never leave a frame callback running forever).
  const deadline = Date.now() + 5000;
  const observeSections = () => {
    const found = document.querySelectorAll('section[id]');
    if (found.length) {
      found.forEach((el) => observer.observe(el));
    } else if (Date.now() < deadline) {
      requestAnimationFrame(observeSections);
    }
  };
  observeSections();

  // The résumé modal is the strongest signal of real interest, so flag it.
  let resumeOpened = false;
  document.addEventListener(
    'click',
    (e) => {
      // .nav-resume opens the modal, .resume-download saves the PDF. The nav
      // trigger is a <button>, so an href-only selector misses every open.
      const el = e.target.closest?.(
        'a[href*="resume"], [data-resume], .nav-resume, .resume-download'
      );
      if (el) resumeOpened = true;
    },
    true
  );

  // Sends the current state of the visit. This can run more than once — a tab
  // that starts hidden (a background cmd-click, very common from social links)
  // would otherwise flush an empty row and then be locked out by a one-shot
  // guard. Every beacon carries the same visitId and the Worker upserts on it,
  // so repeated sends refine one row rather than creating duplicates.
  const flush = () => {
    const payload = JSON.stringify({
      visitId,
      path: location.pathname + location.hash,
      referrer: document.referrer || null,
      utm: location.search || null,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      sections: [...sections],
      dwellMs: Date.now() - start,
      resumeOpened,
    });

    // Skip a resend that would say nothing new (dwell time is excluded from
    // the comparison, since it always differs).
    const fingerprint = [...sections].join(',') + '|' + resumeOpened;
    if (fingerprint === lastSent) return;
    lastSent = fingerprint;

    // sendBeacon survives the page unloading; fetch is the fallback.
    //
    // The blob MUST be text/plain. application/json is not a CORS-safelisted
    // content type, so it forces a preflight — and sendBeacon cannot preflight:
    // it silently drops the payload while still returning true, which also
    // defeats the fallback below. The Worker parses the body either way.
    const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
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
  // And an early row, so a visitor who never triggers a hide is still counted.
  setTimeout(flush, 3_000);
}
