import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { cards, CATEGORIES } from '../data/resumeData';
import './Carousel.css';

const COMPACT_W = 220;
const COMPACT_H = 140;
const EXPANDED_W = 500;
const EXPANDED_H = 400;
const ROTATION_SPEED = 0.012;
const RADIUS = 700;
const PERSPECTIVE = 1800;
const DRAG_THRESHOLD = 8;

const SPRING_OUT = { type: 'spring', damping: 30, stiffness: 260 };
const SPRING_BACK = { type: 'spring', damping: 26, stiffness: 220 };
const FLICK_SPEED = 350;

function releaseVel(positions) {
  if (positions.length < 2) return null;
  const a = positions[positions.length - 1];
  const b = positions[Math.max(0, positions.length - 3)];
  const dt = (a.t - b.t) / 1000;
  if (dt < 0.001) return null;
  return {
    x: ((a.x - b.x) / dt) * 0.012,
    y: ((a.y - b.y) / dt) * 0.012,
  };
}

function releaseSpeed(positions) {
  if (positions.length < 2) return 0;
  const a = positions[positions.length - 1];
  const b = positions[Math.max(0, positions.length - 3)];
  const dt = (a.t - b.t) / 1000;
  if (dt < 0.001) return 0;
  return Math.sqrt(((a.x - b.x) / dt) ** 2 + ((a.y - b.y) / dt) ** 2);
}

function slotScreenCenter(cardIdx, rotation, slotAngle, ringEl) {
  const totalDeg =
    ((slotAngle * cardIdx + rotation) % 360 + 360) % 360;
  const theta = (totalDeg * Math.PI) / 180;
  const x3d = RADIUS * Math.sin(theta);
  const z3d = RADIUS * Math.cos(theta);
  const denom = PERSPECTIVE - z3d;

  let cx, cy;
  if (ringEl) {
    const rr = ringEl.getBoundingClientRect();
    cx = rr.left + rr.width / 2;
    cy = rr.top + rr.height / 2;
  } else {
    cx = window.innerWidth / 2;
    cy = 70 + (window.innerHeight - 70) / 2;
  }

  if (denom <= 50) return { cx, cy };

  const scale = PERSPECTIVE / denom;
  return { cx: cx + x3d * scale, cy };
}

function Carousel({ activeCategory }) {
  const sceneRef = useRef(null);
  const ringRef = useRef(null);
  const slotRefs = useRef({});
  const rotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const activeCategoryRef = useRef(activeCategory);
  const fadeProgressRef = useRef({});
  const startTimeRef = useRef(performance.now());

  const extractedIdRef = useRef(null);
  const returningRef = useRef(null);
  const dragRef = useRef(null);
  const expandAnimsRef = useRef([]);
  const returnAnimsRef = useRef([]);

  const [overlayCard, setOverlayCard] = useState(null);

  const oX = useMotionValue(0);
  const oY = useMotionValue(0);
  const oW = useMotionValue(COMPACT_W);
  const oH = useMotionValue(COMPACT_H);
  const oOpacity = useMotionValue(1);

  const numCards = cards.length;
  const slotAngle = 360 / numCards;

  activeCategoryRef.current = activeCategory;

  const sceneOffset = useCallback(() => {
    const sr = sceneRef.current?.getBoundingClientRect();
    return sr ? { x: sr.left, y: sr.top } : { x: 0, y: 0 };
  }, []);

  // ═══ rAF: rotation + per-card opacity (with crossfade during return) ═══
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time) => {
      const rawDelta = time - lastTime;
      lastTime = time;
      const delta = Math.min(rawDelta, 32);
      const elapsed = time - startTimeRef.current;

      const speedMult = activeCategoryRef.current ? 0.5 : 1;
      rotationRef.current =
        (rotationRef.current + ROTATION_SPEED * delta * speedMult) % 360;

      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      }

      const activeCat = activeCategoryRef.current;
      const hiddenId = extractedIdRef.current;
      const ret = returningRef.current;

      for (let i = 0; i < numCards; i++) {
        const card = cards[i];
        const el = slotRefs.current[card.id];
        if (!el) continue;

        let fade = fadeProgressRef.current[card.id];
        if (fade === undefined) {
          if (elapsed > 200 + i * 50) {
            fadeProgressRef.current[card.id] = 0;
            fade = 0;
          } else {
            el.style.opacity = '0';
            continue;
          }
        }
        fade = Math.min(1, fade + delta * 0.003);
        fadeProgressRef.current[card.id] = fade;

        const angle = slotAngle * i;
        const facing = ((angle + rotationRef.current) % 360 + 360) % 360;
        const norm = facing > 180 ? 360 - facing : facing;
        const depth = norm < 80 ? 1 : Math.max(0, 1 - (norm - 80) / 40);

        let op;
        if (hiddenId === card.id) {
          if (ret && ret.cardId === card.id) {
            const t = Math.min(1, Math.max(0, (time - ret.startTime - 80) / 450));
            op = depth * fade * t;
          } else {
            op = 0;
          }
        } else if (activeCat && card.category !== activeCat) {
          op = Math.min(0.3, depth) * fade;
        } else {
          op = depth * fade;
        }
        el.style.opacity = String(op);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [numCards, slotAngle]);

  const stopAllAnims = useCallback(() => {
    expandAnimsRef.current.forEach((c) => c.stop());
    expandAnimsRef.current = [];
    returnAnimsRef.current.forEach((c) => c.stop());
    returnAnimsRef.current = [];
  }, []);

  // ═══ Start return: FM animate to actual slot position + crossfade ═══
  const startReturn = useCallback(
    () => {
      stopAllAnims();
      dragRef.current = null;

      const cardId = extractedIdRef.current;
      if (!cardId) return;

      const cardIdx = cards.findIndex((c) => c.id === cardId);
      const slotEl = slotRefs.current[cardId];

      const angle = slotAngle * cardIdx;
      const totalDeg = ((angle + rotationRef.current) % 360 + 360) % 360;
      const theta = (totalDeg * Math.PI) / 180;
      const z3d = RADIUS * Math.cos(theta);
      const scale = PERSPECTIVE / (PERSPECTIVE - z3d);
      const tw = COMPACT_W * scale;
      const th = COMPACT_H * scale;

      const so = sceneOffset();
      const x3d = RADIUS * Math.sin(theta);
      const rr = ringRef.current?.getBoundingClientRect();
      const ringCx = rr ? rr.left + rr.width / 2 - so.x : window.innerWidth / 2 - so.x;
      const ringCy = rr ? rr.top + rr.height / 2 - so.y : (70 + (window.innerHeight - 70) / 2) - so.y;

      const tx = ringCx + x3d * scale - tw / 2;
      const ty = ringCy - th / 2;

      setOverlayCard((prev) =>
        prev ? { ...prev, phase: 'returning' } : null
      );

      returningRef.current = {
        cardId,
        cardIdx,
        startTime: performance.now(),
      };

      returnAnimsRef.current = [
        animate(oX, tx, SPRING_BACK),
        animate(oY, ty, SPRING_BACK),
        animate(oW, tw, SPRING_BACK),
        animate(oH, th, SPRING_BACK),
        animate(oOpacity, 0, {
          duration: 0.5,
          delay: 0.08,
          ease: [0.4, 0, 1, 1],
          onComplete: () => {
            if (returningRef.current?.cardId === cardId) {
              returningRef.current = null;
              extractedIdRef.current = null;
              setOverlayCard(null);
              oOpacity.set(1);
              returnAnimsRef.current = [];
            }
          },
        }),
      ];
    },
    [oX, oY, oW, oH, oOpacity, slotAngle, stopAllAnims, sceneOffset]
  );

  // ═══ Extract to center (on click) ═══
  const extractToCenter = useCallback(
    (card, slotRect) => {
      const so = sceneOffset();
      extractedIdRef.current = card.id;
      setOverlayCard({ card, phase: 'expanding' });

      oOpacity.set(1);
      oX.set(slotRect.left - so.x);
      oY.set(slotRect.top - so.y);
      oW.set(slotRect.width || COMPACT_W);
      oH.set(slotRect.height || COMPACT_H);

      const cx = (window.innerWidth - EXPANDED_W) / 2 - so.x;
      const cy = (window.innerHeight - EXPANDED_H) / 2 - so.y;

      expandAnimsRef.current = [
        animate(oX, cx, SPRING_OUT),
        animate(oY, cy, SPRING_OUT),
        animate(oW, EXPANDED_W, SPRING_OUT),
        animate(oH, EXPANDED_H, {
          ...SPRING_OUT,
          onComplete: () => {
            setOverlayCard((prev) =>
              prev ? { ...prev, phase: 'active' } : null
            );
            expandAnimsRef.current = [];
          },
        }),
      ];
    },
    [oX, oY, oW, oH, oOpacity, sceneOffset]
  );

  // ═══ Unified pointer events ═══
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (!d.isDragging && Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        d.isDragging = true;

        if (d.source === 'carousel' && !extractedIdRef.current) {
          if (!d.card.expanded && !d.card.isQuote) {
            dragRef.current = null;
            return;
          }

          const so = sceneOffset();
          extractedIdRef.current = d.cardId;
          setOverlayCard({ card: d.card, phase: 'expanding' });

          oOpacity.set(1);
          oX.set(d.slotRect.left - so.x);
          oY.set(d.slotRect.top - so.y);
          oW.set(d.slotRect.width || COMPACT_W);
          oH.set(d.slotRect.height || COMPACT_H);

          d.sceneOff = so;

          expandAnimsRef.current = [
            animate(oW, EXPANDED_W, SPRING_OUT),
            animate(oH, EXPANDED_H, {
              ...SPRING_OUT,
              onComplete: () => {
                setOverlayCard((prev) =>
                  prev ? { ...prev, phase: 'active' } : null
                );
                expandAnimsRef.current = [];
              },
            }),
          ];
        }
      }

      if (d.isDragging) {
        if (d.source === 'carousel') {
          const so = d.sceneOff || sceneOffset();
          oX.set(e.clientX - so.x - d.grabFracX * oW.get());
          oY.set(e.clientY - so.y - d.grabFracY * oH.get());
        } else {
          const so = d.sceneOff || sceneOffset();
          oX.set(e.clientX - so.x - d.offX);
          oY.set(e.clientY - so.y - d.offY);
        }

        d.positions.push({
          x: e.clientX,
          y: e.clientY,
          t: performance.now(),
        });
        if (d.positions.length > 6) d.positions.shift();
      }
    };

    const onUp = () => {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = null;

      if (d.source === 'carousel') {
        if (d.isDragging) {
          startReturn();
        } else if (d.card.expanded || d.card.isQuote) {
          extractToCenter(d.card, d.slotRect);
        }
      } else if (d.isDragging) {
        if (releaseSpeed(d.positions) > FLICK_SPEED) {
          startReturn();
        } else {
          const so = sceneOffset();
          const cx = (window.innerWidth - EXPANDED_W) / 2 - so.x;
          const cy = (window.innerHeight - EXPANDED_H) / 2 - so.y;
          animate(oX, cx, SPRING_OUT);
          animate(oY, cy, SPRING_OUT);
        }
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [oX, oY, oW, oH, oOpacity, startReturn, extractToCenter, sceneOffset]);

  // ═══ Carousel card pointerdown ═══
  const handleCardPointerDown = useCallback((card, e) => {
    if (extractedIdRef.current || returningRef.current) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    const slotEl = slotRefs.current[card.id];
    if (!slotEl) return;
    const rect = slotEl.getBoundingClientRect();

    dragRef.current = {
      source: 'carousel',
      cardId: card.id,
      card,
      grabFracX: (e.clientX - rect.left) / (rect.width || 1),
      grabFracY: (e.clientY - rect.top) / (rect.height || 1),
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      positions: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
      slotRect: rect,
    };
  }, []);

  // ═══ Overlay card pointerdown (drag expanded card) ═══
  const handleOverlayPointerDown = useCallback(
    (e) => {
      if (!extractedIdRef.current || returningRef.current) return;
      if (e.target.closest('.overlay-close') || e.target.closest('a')) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      stopAllAnims();
      const so = sceneOffset();

      dragRef.current = {
        source: 'overlay',
        offX: e.clientX - so.x - oX.get(),
        offY: e.clientY - so.y - oY.get(),
        startX: e.clientX,
        startY: e.clientY,
        isDragging: false,
        positions: [{ x: e.clientX, y: e.clientY, t: performance.now() }],
        sceneOff: so,
      };
    },
    [oX, oY, stopAllAnims, sceneOffset]
  );

  const handleCloseClick = useCallback(
    (e) => {
      e.stopPropagation();
      startReturn();
    },
    [startReturn]
  );

  const handleBackdropClick = useCallback(() => {
    startReturn();
  }, [startReturn]);

  // ═══ Render ═══
  const isExpanded = overlayCard && overlayCard.phase !== 'returning';

  return (
    <div ref={sceneRef} className="carousel-scene" style={{ perspective: PERSPECTIVE }}>
      {/* 3D ring */}
      <div className="carousel-ring" ref={ringRef}>
        {cards.map((card, i) => {
          const angle = slotAngle * i;
          const cat = CATEGORIES[card.category];
          const isHighlighted =
            activeCategory && card.category === activeCategory;

          return (
            <div
              key={card.id}
              ref={(el) => {
                if (el) slotRefs.current[card.id] = el;
              }}
              className="carousel-slot"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${RADIUS}px)`,
              }}
            >
              <div
                className={`carousel-card${isHighlighted ? ' carousel-card--glow' : ''}`}
                style={
                  isHighlighted ? { '--glow-color': cat.color } : undefined
                }
                onPointerDown={(e) => handleCardPointerDown(card, e)}
              >
                <CardCompact card={card} cat={cat} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {overlayCard && overlayCard.phase !== 'returning' && (
          <motion.div
            key="backdrop"
            className="overlay-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleBackdropClick}
          />
        )}
      </AnimatePresence>

      {/* Overlay card */}
      {overlayCard && (
        <motion.div
          className={`overlay-card${overlayCard.phase === 'returning' ? ' overlay-card--returning' : ''}`}
          style={{
            x: oX,
            y: oY,
            width: oW,
            height: oH,
            opacity: oOpacity,
          }}
          onPointerDown={handleOverlayPointerDown}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="overlay-close" onClick={handleCloseClick}>
            &times;
          </button>
          <CardFull card={overlayCard.card} expanded={isExpanded} />
        </motion.div>
      )}
    </div>
  );
}

// ═══ Compact card content (carousel slots) ═══
function CardCompact({ card, cat }) {
  if (card.isQuote) {
    return (
      <>
        <div className="cc-accent" style={{ backgroundColor: cat.color }} />
        <div className="cc-body">
          <p className="cc-quote">&ldquo;{card.quoteText}&rdquo;</p>
          <p className="cc-author">&mdash; {card.quoteAuthor}</p>
        </div>
      </>
    );
  }

  if (card.isPhoto) {
    return (
      <div className="cc-photo" style={{ borderColor: cat.color + '40' }}>
        <span>+</span>
      </div>
    );
  }

  return (
    <>
      <div className="cc-accent" style={{ backgroundColor: cat.color }} />
      <div className="cc-body">
        <span className="cc-category" style={{ color: cat.color }}>
          {cat.label}
        </span>
        <h3 className="cc-title">{card.title}</h3>
        {card.subtitle && <p className="cc-subtitle">{card.subtitle}</p>}
        {card.preview && <p className="cc-preview">{card.preview}</p>}
      </div>
    </>
  );
}

// ═══ Full card content (overlay — shows details when expanded) ═══
function CardFull({ card, expanded }) {
  const cat = CATEGORIES[card.category];
  const data = card.expanded;

  if (card.isQuote) {
    return (
      <>
        <div className="cc-accent" style={{ backgroundColor: cat.color }} />
        <div className="cc-body ov-body">
          <p className={`cc-quote${expanded ? ' cc-quote--large' : ''}`}>
            &ldquo;{card.quoteText}&rdquo;
          </p>
          <p className="cc-author">&mdash; {card.quoteAuthor}</p>
        </div>
      </>
    );
  }

  if (card.isPhoto) {
    return (
      <div className="cc-photo" style={{ borderColor: cat.color + '40' }}>
        <span>+</span>
      </div>
    );
  }

  return (
    <>
      <div className="cc-accent" style={{ backgroundColor: cat.color }} />
      <div className="cc-body ov-body">
        <span className="cc-category" style={{ color: cat.color }}>
          {cat.label}
        </span>
        <h3 className="cc-title ov-title">
          {expanded && data?.heading ? data.heading : card.title}
        </h3>
        {expanded && data?.subheading ? (
          <p className="cc-subtitle">{data.subheading}</p>
        ) : (
          card.subtitle && <p className="cc-subtitle">{card.subtitle}</p>
        )}

        {data && (
          <div className={`ov-details${expanded ? ' ov-details--show' : ''}`}>
            {data.meta && <p className="ov-meta">{data.meta}</p>}

            {data.bullets && (
              <ul className="ov-bullets">
                {data.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}

            {data.tags && (
              <div className="ov-tags">
                {data.tags.map((t, i) => (
                  <span
                    key={i}
                    className="ov-tag"
                    style={{ borderColor: cat.color + '50', color: cat.color }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {data.links && (
              <div className="ov-links">
                {data.links.map((l, i) => (
                  <div key={i} className="ov-link-row">
                    <span className="ov-link-label">{l.label}</span>
                    {l.url ? (
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ov-link"
                      >
                        {l.text}
                      </a>
                    ) : (
                      <span className="ov-link-text">{l.text}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.description && (
              <p className="ov-description">{data.description}</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Carousel;
