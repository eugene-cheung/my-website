import { useRef, useCallback, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cards } from '../data/resumeData';
import { computeBentoLayout } from '../utils/bentoLayout';
import { usePhysics } from '../hooks/usePhysics';
import FloatingCard from './FloatingCard';
import ExpandedCard from './ExpandedCard';
import MobileLayout from './MobileLayout';
import './PhysicsWorld.css';

const MOBILE_BREAKPOINT = 768;

function PhysicsWorld({ activeCategory, expandedCard, setExpandedCard, onOrganizeReady }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
  const lastExpandedIdRef = useRef(null);
  const [blackHole, setBlackHole] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef(null);
  const dragRef = useRef(null);

  const layoutRef = useRef(
    computeBentoLayout(cards, window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) {
        layoutRef.current = computeBentoLayout(
          cards,
          window.innerWidth,
          window.innerHeight
        );
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (blackHole && blackHole.phase === 'suck') {
      hintTimerRef.current = setTimeout(() => setShowHint(true), 10000);
    } else {
      setShowHint(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    }
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [blackHole?.phase]);

  const {
    registerCardElement,
    setExpanded,
    clearExpanded,
    getBodyPosition,
    organize,
    spawnBlackHole,
    startDrag,
    updateDrag,
    endDrag,
  } = usePhysics(cards, activeCategory, layoutRef);

  const organizeRef = useRef(organize);
  organizeRef.current = organize;
  if (onOrganizeReady) onOrganizeReady(organizeRef);

  const handleCardClick = useCallback(
    (card) => {
      if (expandedCard) return;
      const pos = getBodyPosition(card.id);
      const dims = layoutRef.current[card.id] || {
        width: card.width,
        height: card.height,
      };

      setExpanded(card.id);
      lastExpandedIdRef.current = card.id;

      setExpandedCard({
        card,
        fromRect: {
          x: pos.x - dims.width / 2,
          y: pos.y - dims.height / 2,
          width: dims.width,
          height: dims.height,
          angle: pos.angle,
        },
      });
    },
    [getBodyPosition, setExpanded, setExpandedCard, expandedCard]
  );

  const handleClose = useCallback(
    () => setExpandedCard(null),
    [setExpandedCard]
  );

  const handleExitComplete = useCallback(() => {
    if (lastExpandedIdRef.current) {
      clearExpanded(lastExpandedIdRef.current);
      lastExpandedIdRef.current = null;
    }
  }, [clearExpanded]);

  const handleCardPointerDown = useCallback(
    (card, e) => {
      if (expandedCard) return;
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();

      dragRef.current = {
        cardId: card.id,
        card,
        startX: e.clientX,
        startY: e.clientY,
        isDragging: false,
        lastPositions: [
          { x: e.clientX, y: e.clientY, t: performance.now() },
        ],
      };

      startDrag(card.id, e.clientX, e.clientY);
    },
    [expandedCard, startDrag]
  );

  useEffect(() => {
    const onPointerMove = (e) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (!drag.isDragging && Math.sqrt(dx * dx + dy * dy) > 5) {
        drag.isDragging = true;
      }

      if (drag.isDragging) {
        updateDrag(e.clientX, e.clientY);
        drag.lastPositions.push({
          x: e.clientX,
          y: e.clientY,
          t: performance.now(),
        });
        if (drag.lastPositions.length > 6) drag.lastPositions.shift();
      }
    };

    const onPointerUp = () => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.isDragging) {
        const positions = drag.lastPositions;
        let velX = 0;
        let velY = 0;
        if (positions.length >= 2) {
          const recent = positions[positions.length - 1];
          const older = positions[Math.max(0, positions.length - 4)];
          const dt = (recent.t - older.t) / 1000;
          if (dt > 0.001) {
            velX = ((recent.x - older.x) / dt) * 0.04;
            velY = ((recent.y - older.y) / dt) * 0.04;
          }
        }
        endDrag(velX, velY);
      } else {
        endDrag(0, 0);
        handleCardClick(drag.card);
      }

      dragRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [updateDrag, endDrag, handleCardClick]);

  const handleDoubleClick = useCallback(
    (e) => {
      if (expandedCard) return;
      if (e.target.closest('.floating-card') || e.target.closest('.navbar'))
        return;

      if (blackHole && blackHole.phase === 'suck') {
        spawnBlackHole(
          blackHole.x,
          blackHole.y,
          (phase) => {
            setBlackHole((prev) => (prev ? { ...prev, phase } : null));
            setShaking(true);
            setTimeout(() => setShaking(false), 600);
          },
          () => setTimeout(() => setBlackHole(null), 500)
        );
        return;
      }

      if (blackHole) return;

      const x = e.clientX;
      const y = e.clientY;
      setBlackHole({ x, y, phase: 'suck' });
      spawnBlackHole(x, y, null, null);
    },
    [expandedCard, blackHole, spawnBlackHole]
  );

  if (isMobile) {
    return (
      <MobileLayout
        activeCategory={activeCategory}
        expandedCard={expandedCard}
        setExpandedCard={setExpandedCard}
      />
    );
  }

  const layout = layoutRef.current;

  return (
    <div
      className={`physics-world${shaking ? ' shake' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      {cards.map((card) => {
        const l = layout[card.id];
        return (
          <FloatingCard
            key={card.id}
            card={card}
            ref={(el) => registerCardElement(card.id, el)}
            onPointerDown={(e) => handleCardPointerDown(card, e)}
            width={l?.width}
            height={l?.height}
            dimmed={!!activeCategory && card.category !== activeCategory}
            hidden={expandedCard?.card.id === card.id}
          />
        );
      })}

      {blackHole && (
        <div
          className={`black-hole${blackHole.phase === 'suck' ? ' black-hole--suck' : ''}${blackHole.phase === 'explode' ? ' black-hole--bang' : ''}`}
          style={{ left: blackHole.x, top: blackHole.y }}
        >
          <div className="bh-void" />
          <div className="bh-ripple bh-ripple-1" />
          <div className="bh-ripple bh-ripple-2" />
          <div className="bh-ripple bh-ripple-3" />
          <div className="bh-ripple bh-ripple-4" />
          <div className="bh-swirl" />
          <div className="bh-glow" />
          {showHint && <div className="bh-hint">double click</div>}
        </div>
      )}

      <AnimatePresence onExitComplete={handleExitComplete}>
        {expandedCard && (
          <ExpandedCard
            key={expandedCard.card.id}
            cardData={expandedCard.card}
            fromRect={expandedCard.fromRect}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default PhysicsWorld;
