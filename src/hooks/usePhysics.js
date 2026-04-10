import { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Composite, Bodies, Body } = Matter;

const REPULSION_RADIUS = 300;
const REPULSION_STRENGTH = 0.045;
const DRIFT_INTERVAL = 3000;
const DRIFT_STRENGTH = 0.00012;
const CURRENT_STRENGTH = 0.000015;
const NAV_HEIGHT = 70;
const MAX_SPEED = 4;
const MAX_SPEED_AFTER_SLAM = 25;
const MAX_SPEED_BIG_BANG = 55;
const MAX_ANGULAR = 0.05;
const SLAM_RADIUS = 700;
const SLAM_STRENGTH = 18;

export function usePhysics(cards, activeCategory) {
  const engineRef = useRef(null);
  const bodiesMapRef = useRef({});
  const cardElementsRef = useRef({});
  const mousePosRef = useRef({ x: -9999, y: -9999 });
  const expandedIdRef = useRef(null);
  const animFrameRef = useRef(null);
  const wallsRef = useRef([]);
  const dimensionsRef = useRef({});
  const activeCategoryRef = useRef(activeCategory);
  const initializedRef = useRef(false);
  const cardsRef = useRef(cards);
  const slamCooldownRef = useRef(0);
  const bigBangCooldownRef = useRef(0);
  const blackHoleRef = useRef(null);

  activeCategoryRef.current = activeCategory;
  cardsRef.current = cards;

  const registerCardElement = useCallback((id, element) => {
    if (element) {
      cardElementsRef.current[id] = element;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
    });
    engineRef.current = engine;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const wallOpts = { isStatic: true, restitution: 0.7, friction: 0, render: { visible: false } };
    const t = 60;

    const walls = [
      Bodies.rectangle(width / 2, NAV_HEIGHT - t / 2, width * 3, t, wallOpts),
      Bodies.rectangle(width / 2, height + t / 2, width * 3, t, wallOpts),
      Bodies.rectangle(-t / 2, height / 2, t, height * 3, wallOpts),
      Bodies.rectangle(width + t / 2, height / 2, t, height * 3, wallOpts),
    ];
    wallsRef.current = walls;
    Composite.add(engine.world, walls);

    const usableWidth = width - 120;
    const usableHeight = height - NAV_HEIGHT - 80;
    const cols = Math.ceil(Math.sqrt(cards.length * (usableWidth / usableHeight)));
    const rows = Math.ceil(cards.length / cols);
    const cellW = usableWidth / cols;
    const cellH = usableHeight / rows;

    cards.forEach((card, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 60 + col * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.4;
      const y = NAV_HEIGHT + 40 + row * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.4;

      const body = Bodies.rectangle(
        Math.max(card.width / 2 + 10, Math.min(width - card.width / 2 - 10, x)),
        Math.max(NAV_HEIGHT + card.height / 2, Math.min(height - card.height / 2 - 10, y)),
        card.width,
        card.height,
        {
          restitution: 0.6,
          friction: 0.01,
          frictionAir: 0.03,
          density: 0.001,
          angle: (Math.random() - 0.5) * 0.4,
          chamfer: { radius: 10 },
          label: card.id,
        }
      );

      bodiesMapRef.current[card.id] = body;
      dimensionsRef.current[card.id] = { width: card.width, height: card.height };
      Composite.add(engine.world, body);
    });

    const onMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mousePosRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    cards.forEach((card, i) => {
      setTimeout(() => {
        const el = cardElementsRef.current[card.id];
        if (el) el.style.opacity = '1';
      }, 150 + i * 50);
    });

    let lastTime = performance.now();
    let driftAccum = 0;

    const loop = (time) => {
      const rawDelta = time - lastTime;
      lastTime = time;
      const delta = Math.min(rawDelta, 32);
      driftAccum += delta;

      const currentAngle = time * 0.00008;
      const cx = Math.cos(currentAngle) * CURRENT_STRENGTH;
      const cy = Math.sin(currentAngle) * CURRENT_STRENGTH;

      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      const activeCat = activeCategoryRef.current;
      const currentCards = cardsRef.current;

      const shouldDrift = driftAccum > DRIFT_INTERVAL;
      if (shouldDrift) driftAccum = 0;

      if (slamCooldownRef.current > 0) slamCooldownRef.current -= delta;
      if (bigBangCooldownRef.current > 0) bigBangCooldownRef.current -= delta;
      const slamActive = slamCooldownRef.current > 0;
      const bangActive = bigBangCooldownRef.current > 0;
      const bhSucking = blackHoleRef.current?.phase === 'suck';
      const currentMaxSpeed = bangActive ? MAX_SPEED_BIG_BANG : (slamActive || bhSucking ? MAX_SPEED_AFTER_SLAM : MAX_SPEED);
      const currentMaxAngular = slamActive || bangActive ? 0.15 : MAX_ANGULAR;

      const bodyEntries = Object.entries(bodiesMapRef.current);
      for (let i = 0; i < bodyEntries.length; i++) {
        const [id, body] = bodyEntries[i];
        if (body.isStatic) continue;

        Body.applyForce(body, body.position, { x: cx, y: cy });

        if (shouldDrift) {
          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * DRIFT_STRENGTH,
            y: (Math.random() - 0.5) * DRIFT_STRENGTH,
          });
        }

        if (!bhSucking) {
          const dx = body.position.x - mx;
          const dy = body.position.y - my;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPULSION_RADIUS * REPULSION_RADIUS && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const norm = 1 - dist / REPULSION_RADIUS;
            const force = REPULSION_STRENGTH * norm * norm;
            Body.applyForce(body, body.position, {
              x: (dx / dist) * force,
              y: (dy / dist) * force,
            });
          }
        }

        if (activeCat) {
          const card = currentCards.find((c) => c.id === id);
          if (card && card.category === activeCat) {
            const centerX = window.innerWidth / 2;
            const centerY = (window.innerHeight + NAV_HEIGHT) / 2;
            const dxc = centerX - body.position.x;
            const dyc = centerY - body.position.y;
            const distc = Math.sqrt(dxc * dxc + dyc * dyc);
            if (distc > 80) {
              Body.applyForce(body, body.position, {
                x: (dxc / distc) * 0.0003,
                y: (dyc / distc) * 0.0003,
              });
            }
          }
        }

        const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
        if (speed > currentMaxSpeed) {
          Body.setVelocity(body, {
            x: (body.velocity.x / speed) * currentMaxSpeed,
            y: (body.velocity.y / speed) * currentMaxSpeed,
          });
        }
        if (Math.abs(body.angularVelocity) > currentMaxAngular) {
          Body.setAngularVelocity(body, Math.sign(body.angularVelocity) * currentMaxAngular);
        }
        if (Math.abs(body.angle) > 0.35 && !slamActive) {
          Body.setAngle(body, body.angle * 0.993);
        }
      }

      const bh = blackHoleRef.current;
      if (bh && bh.phase === 'suck') {
        bh.elapsed = (bh.elapsed || 0) + delta;
        const t = bh.elapsed / 1000;

        for (let i = 0; i < bodyEntries.length; i++) {
          const [, body] = bodyEntries[i];
          if (body.isStatic) continue;
          const dx = bh.x - body.position.x;
          const dy = bh.y - body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) continue;

          const pull = (0.008 + t * 0.012) * (1 + 600 / (dist + 4));
          const spin = (0.001 + Math.min(t, 2) * 0.002) * (1 + 80 / (dist + 4));
          Body.applyForce(body, body.position, {
            x: (dx / dist) * pull + (-dy / dist) * spin,
            y: (dy / dist) * pull + (dx / dist) * spin,
          });

          const steer = Math.min(0.06 + t * 0.08, 0.7);
          Body.setVelocity(body, {
            x: body.velocity.x * (1 - steer) + (dx / dist) * 4 * steer,
            y: body.velocity.y * (1 - steer) + (dy / dist) * 4 * steer,
          });

          if (t > 1.5) {
            const drag = Math.min((t - 1.5) * 0.04, 0.35);
            Body.setPosition(body, {
              x: body.position.x + dx * drag,
              y: body.position.y + dy * drag,
            });
          }
        }
      }

      Engine.update(engine, delta);

      for (let i = 0; i < bodyEntries.length; i++) {
        const [id, body] = bodyEntries[i];
        const el = cardElementsRef.current[id];
        if (!el || id === expandedIdRef.current) continue;
        const dims = dimensionsRef.current[id];
        el.style.transform = `translate(${body.position.x - dims.width / 2}px, ${body.position.y - dims.height / 2}px) rotate(${body.angle}rad)`;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      Body.setPosition(walls[0], { x: w / 2, y: NAV_HEIGHT - 30 });
      Body.setVertices(walls[0], Bodies.rectangle(w / 2, NAV_HEIGHT - 30, w * 3, 60).vertices);
      Body.setPosition(walls[1], { x: w / 2, y: h + 30 });
      Body.setVertices(walls[1], Bodies.rectangle(w / 2, h + 30, w * 3, 60).vertices);
      Body.setPosition(walls[2], { x: -30, y: h / 2 });
      Body.setVertices(walls[2], Bodies.rectangle(-30, h / 2, 60, h * 3).vertices);
      Body.setPosition(walls[3], { x: w + 30, y: h / 2 });
      Body.setVertices(walls[3], Bodies.rectangle(w + 30, h / 2, 60, h * 3).vertices);
    };
    window.addEventListener('resize', onResize);

    return () => {
      initializedRef.current = false;
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onResize);
      bodiesMapRef.current = {};
      cardElementsRef.current = {};
      dimensionsRef.current = {};
      slamCooldownRef.current = 0;
      bigBangCooldownRef.current = 0;
      blackHoleRef.current = null;
      Composite.clear(engine.world);
      Engine.clear(engine);
    };
  }, [cards]);

  const setExpanded = useCallback((id) => {
    expandedIdRef.current = id;
    const body = bodiesMapRef.current[id];
    if (body) Body.setStatic(body, true);
  }, []);

  const clearExpanded = useCallback((id) => {
    const body = bodiesMapRef.current[id];
    if (body) {
      const slamX = body.position.x;
      const slamY = body.position.y;

      Body.setStatic(body, false);
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngularVelocity(body, 0);

      slamCooldownRef.current = 1200;

      const allBodies = Object.entries(bodiesMapRef.current);
      for (let i = 0; i < allBodies.length; i++) {
        const [otherId, other] = allBodies[i];
        if (otherId === id || other.isStatic) continue;

        const dx = other.position.x - slamX;
        const dy = other.position.y - slamY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SLAM_RADIUS && dist > 1) {
          const norm = 1 - dist / SLAM_RADIUS;
          const impulse = SLAM_STRENGTH * norm * norm;
          Body.setVelocity(other, {
            x: other.velocity.x + (dx / dist) * impulse,
            y: other.velocity.y + (dy / dist) * impulse,
          });
          Body.setAngularVelocity(
            other,
            other.angularVelocity + (Math.random() - 0.5) * 0.12
          );
        }
      }
    }
    expandedIdRef.current = null;
  }, []);

  const getBodyPosition = useCallback((id) => {
    const body = bodiesMapRef.current[id];
    if (!body) return { x: 0, y: 0, angle: 0 };
    return { x: body.position.x, y: body.position.y, angle: body.angle };
  }, []);

  const shuffle = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    slamCooldownRef.current = 1800;
    const currentCards = cardsRef.current;

    const entries = Object.entries(bodiesMapRef.current);
    for (let i = 0; i < entries.length; i++) {
      const [id, oldBody] = entries[i];
      if (oldBody.isStatic) continue;

      const cardData = currentCards.find((c) => c.id === id);
      if (!cardData) continue;

      const mult = 0.45 + Math.random() * 1.6;
      const newW = Math.round(cardData.width * mult);
      const newH = Math.round(cardData.height * mult);

      const newBody = Bodies.rectangle(
        oldBody.position.x,
        oldBody.position.y,
        newW,
        newH,
        {
          restitution: 0.6,
          friction: 0.01,
          frictionAir: 0.03,
          density: 0.001,
          angle: oldBody.angle,
          chamfer: { radius: 10 },
          label: id,
        }
      );

      Body.setVelocity(newBody, {
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 14,
      });
      Body.setAngularVelocity(newBody, (Math.random() - 0.5) * 0.15);

      Composite.remove(engine.world, oldBody);
      Composite.add(engine.world, newBody);
      bodiesMapRef.current[id] = newBody;
      dimensionsRef.current[id] = { width: newW, height: newH };

      const el = cardElementsRef.current[id];
      if (el) {
        el.style.width = newW + 'px';
        el.style.height = newH + 'px';
      }
    }
  }, []);

  const spawnBlackHole = useCallback((x, y, onPhase, onEnd) => {
    const bh = blackHoleRef.current;

    if (bh && bh.phase === 'suck') {
      bh.phase = 'explode';
      bigBangCooldownRef.current = 3500;

      const bodyEntries = Object.entries(bodiesMapRef.current);
      for (let i = 0; i < bodyEntries.length; i++) {
        const [, body] = bodyEntries[i];
        if (body.isStatic) continue;
        const dx = body.position.x - bh.x;
        const dy = body.position.y - bh.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = dist > 5 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
        const power = 38 + Math.random() * 18;
        Body.setVelocity(body, {
          x: Math.cos(angle) * power + (Math.random() - 0.5) * 10,
          y: Math.sin(angle) * power + (Math.random() - 0.5) * 10,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);
      }

      if (onPhase) onPhase('explode');
      setTimeout(() => {
        blackHoleRef.current = null;
        if (onEnd) onEnd();
      }, 600);
      return;
    }

    if (bh) return;
    blackHoleRef.current = { x, y, phase: 'suck', elapsed: 0 };
  }, []);

  return { registerCardElement, setExpanded, clearExpanded, getBodyPosition, shuffle, spawnBlackHole };
}
