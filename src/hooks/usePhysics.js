import { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Composite, Bodies, Body } = Matter;

const NAV_HEIGHT = 70;
const REPULSION_RADIUS = 200;
const REPULSION_STRENGTH = 0.02;
const DRIFT_INTERVAL = 5000;
const DRIFT_STRENGTH = 0.00006;
const CURRENT_STRENGTH = 0.000008;
const MAX_SPEED = 4;
const MAX_SPEED_AFTER_SLAM = 25;
const MAX_SPEED_BIG_BANG = 55;
const MAX_ANGULAR = 0.04;
const SLAM_RADIUS = 700;
const SLAM_STRENGTH = 18;

const SPRING_K = 0.0004;
const SPRING_K_ORGANIZE = 0.004;
const ANGLE_DAMP = 0.992;
const ANGLE_DAMP_ORGANIZE = 0.93;

export function usePhysics(cards, activeCategory, layoutRef) {
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
  const homePositionsRef = useRef({});
  const organizingRef = useRef(false);
  const grabbedBodyRef = useRef(null);
  const grabOffsetRef = useRef({ x: 0, y: 0 });

  activeCategoryRef.current = activeCategory;
  cardsRef.current = cards;

  const registerCardElement = useCallback((id, element) => {
    if (element) cardElementsRef.current[id] = element;
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const engine = Engine.create({ gravity: { x: 0, y: 0, scale: 0 } });
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

    const layout = layoutRef.current;

    cards.forEach((card) => {
      const home = layout[card.id];
      if (!home) return;

      const body = Bodies.rectangle(home.x, home.y, home.width, home.height, {
        restitution: 0.6,
        friction: 0.01,
        frictionAir: 0.035,
        density: 0.001,
        angle: 0,
        chamfer: { radius: 10 },
        label: card.id,
      });

      bodiesMapRef.current[card.id] = body;
      dimensionsRef.current[card.id] = { width: home.width, height: home.height };
      homePositionsRef.current[card.id] = { x: home.x, y: home.y };
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
      }, 100 + i * 40);
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

      const shouldDrift = driftAccum > DRIFT_INTERVAL;
      if (shouldDrift) driftAccum = 0;

      if (slamCooldownRef.current > 0) slamCooldownRef.current -= delta;
      if (bigBangCooldownRef.current > 0) bigBangCooldownRef.current -= delta;
      const slamActive = slamCooldownRef.current > 0;
      const bangActive = bigBangCooldownRef.current > 0;
      const bhSucking = blackHoleRef.current?.phase === 'suck';
      const isOrganizing = organizingRef.current;
      const currentMaxSpeed = bangActive
        ? MAX_SPEED_BIG_BANG
        : slamActive || bhSucking
          ? MAX_SPEED_AFTER_SLAM
          : MAX_SPEED;
      const currentMaxAngular = slamActive || bangActive ? 0.15 : MAX_ANGULAR;
      const springK = isOrganizing ? SPRING_K_ORGANIZE : SPRING_K;
      const angleDamp = isOrganizing ? ANGLE_DAMP_ORGANIZE : ANGLE_DAMP;

      const grabbedId = grabbedBodyRef.current?.id;
      const bodyEntries = Object.entries(bodiesMapRef.current);

      for (let i = 0; i < bodyEntries.length; i++) {
        const [id, body] = bodyEntries[i];
        if (body.isStatic) continue;

        const home = homePositionsRef.current[id];
        if (home && id !== grabbedId) {
          const hdx = home.x - body.position.x;
          const hdy = home.y - body.position.y;
          Body.applyForce(body, body.position, { x: hdx * springK, y: hdy * springK });
        }

        Body.applyForce(body, body.position, { x: cx, y: cy });

        if (shouldDrift && !isOrganizing) {
          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * DRIFT_STRENGTH,
            y: (Math.random() - 0.5) * DRIFT_STRENGTH,
          });
        }

        if (!bhSucking && !isOrganizing) {
          const rdx = body.position.x - mx;
          const rdy = body.position.y - my;
          const distSq = rdx * rdx + rdy * rdy;
          if (distSq < REPULSION_RADIUS * REPULSION_RADIUS && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const norm = 1 - dist / REPULSION_RADIUS;
            const force = REPULSION_STRENGTH * norm * norm;
            Body.applyForce(body, body.position, {
              x: (rdx / dist) * force,
              y: (rdy / dist) * force,
            });
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

        if (Math.abs(body.angle) > 0.01) {
          Body.setAngle(body, body.angle * angleDamp);
        }
      }

      const bh = blackHoleRef.current;
      if (bh && bh.phase === 'suck') {
        bh.elapsed = (bh.elapsed || 0) + delta;
        const bhT = bh.elapsed / 1000;

        for (let i = 0; i < bodyEntries.length; i++) {
          const [, body] = bodyEntries[i];
          if (body.isStatic) continue;
          const dx = bh.x - body.position.x;
          const dy = bh.y - body.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) continue;

          const pull = (0.008 + bhT * 0.012) * (1 + 600 / (dist + 4));
          const spin = (0.001 + Math.min(bhT, 2) * 0.002) * (1 + 80 / (dist + 4));
          Body.applyForce(body, body.position, {
            x: (dx / dist) * pull + (-dy / dist) * spin,
            y: (dy / dist) * pull + (dx / dist) * spin,
          });

          const steer = Math.min(0.06 + bhT * 0.08, 0.7);
          Body.setVelocity(body, {
            x: body.velocity.x * (1 - steer) + (dx / dist) * 4 * steer,
            y: body.velocity.y * (1 - steer) + (dy / dist) * 4 * steer,
          });

          if (bhT > 1.5) {
            const drag = Math.min((bhT - 1.5) * 0.04, 0.35);
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
        if (!el || id === expandedIdRef.current || id === grabbedId) continue;
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

      if (layoutRef.current) {
        for (const [id, home] of Object.entries(layoutRef.current)) {
          homePositionsRef.current[id] = { x: home.x, y: home.y };
        }
      }
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
      homePositionsRef.current = {};
      slamCooldownRef.current = 0;
      bigBangCooldownRef.current = 0;
      blackHoleRef.current = null;
      grabbedBodyRef.current = null;
      Composite.clear(engine.world);
      Engine.clear(engine);
    };
  }, [cards, layoutRef]);

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

  const organize = useCallback(() => {
    organizingRef.current = true;

    const bodyEntries = Object.entries(bodiesMapRef.current);
    for (const [id, body] of bodyEntries) {
      if (body.isStatic) continue;
      const home = homePositionsRef.current[id];
      if (!home) continue;

      const dx = home.x - body.position.x;
      const dy = home.y - body.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const speed = Math.min(dist * 0.06, 12);
        Body.setVelocity(body, {
          x: (dx / dist) * speed,
          y: (dy / dist) * speed,
        });
      }
      Body.setAngularVelocity(body, -body.angle * 0.2);
    }

    setTimeout(() => {
      organizingRef.current = false;
    }, 2000);
  }, []);

  const startDrag = useCallback((cardId, mouseX, mouseY) => {
    const body = bodiesMapRef.current[cardId];
    if (!body) return;
    Body.setStatic(body, true);
    grabbedBodyRef.current = { id: cardId, body };
    grabOffsetRef.current = {
      x: body.position.x - mouseX,
      y: body.position.y - mouseY,
    };

    const el = cardElementsRef.current[cardId];
    if (el) {
      el.style.zIndex = '50';
      el.style.cursor = 'grabbing';
    }
  }, []);

  const updateDrag = useCallback((mouseX, mouseY) => {
    const grabbed = grabbedBodyRef.current;
    if (!grabbed) return;
    const x = mouseX + grabOffsetRef.current.x;
    const y = mouseY + grabOffsetRef.current.y;
    Body.setPosition(grabbed.body, { x, y });

    const el = cardElementsRef.current[grabbed.id];
    const dims = dimensionsRef.current[grabbed.id];
    if (el && dims) {
      el.style.transform = `translate(${x - dims.width / 2}px, ${y - dims.height / 2}px) rotate(${grabbed.body.angle}rad)`;
    }
  }, []);

  const endDrag = useCallback((velX, velY) => {
    const grabbed = grabbedBodyRef.current;
    if (!grabbed) return;

    const el = cardElementsRef.current[grabbed.id];
    if (el) {
      el.style.zIndex = '';
      el.style.cursor = '';
    }

    Body.setStatic(grabbed.body, false);
    const clampedVelX = Math.max(-20, Math.min(20, velX));
    const clampedVelY = Math.max(-20, Math.min(20, velY));
    Body.setVelocity(grabbed.body, { x: clampedVelX, y: clampedVelY });
    grabbedBodyRef.current = null;
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

  return {
    registerCardElement,
    setExpanded,
    clearExpanded,
    getBodyPosition,
    organize,
    spawnBlackHole,
    startDrag,
    updateDrag,
    endDrag,
  };
}
