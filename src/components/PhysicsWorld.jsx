import { useRef, useCallback, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cards } from '../data/resumeData';
import { usePhysics } from '../hooks/usePhysics';
import FloatingCard from './FloatingCard';
import ExpandedCard from './ExpandedCard';
import './PhysicsWorld.css';

function PhysicsWorld({ activeCategory, expandedCard, setExpandedCard, onShuffleReady }) {
  const lastExpandedIdRef = useRef(null);
  const [blackHole, setBlackHole] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef(null);

  useEffect(() => {
    if (blackHole && blackHole.phase === 'suck') {
      hintTimerRef.current = setTimeout(() => setShowHint(true), 10000);
    } else {
      setShowHint(false);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    }
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [blackHole?.phase]);

  const { registerCardElement, setExpanded, clearExpanded, getBodyPosition, shuffle, spawnBlackHole } = usePhysics(
    cards,
    activeCategory
  );

  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  if (onShuffleReady) onShuffleReady(shuffleRef);

  const handleCardClick = useCallback(
    (card) => {
      if (expandedCard) return;
      const pos = getBodyPosition(card.id);

      setExpanded(card.id);
      lastExpandedIdRef.current = card.id;

      setExpandedCard({
        card,
        fromRect: {
          x: pos.x - card.width / 2,
          y: pos.y - card.height / 2,
          width: card.width,
          height: card.height,
          angle: pos.angle,
        },
      });
    },
    [getBodyPosition, setExpanded, setExpandedCard, expandedCard]
  );

  const handleClose = useCallback(() => {
    setExpandedCard(null);
  }, [setExpandedCard]);

  const handleExitComplete = useCallback(() => {
    if (lastExpandedIdRef.current) {
      clearExpanded(lastExpandedIdRef.current);
      lastExpandedIdRef.current = null;
    }
  }, [clearExpanded]);

  const handleDoubleClick = useCallback(
    (e) => {
      if (expandedCard) return;
      if (e.target.closest('.floating-card') || e.target.closest('.navbar')) return;

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

  return (
    <div className={`physics-world${shaking ? ' shake' : ''}`} onDoubleClick={handleDoubleClick}>
      {cards.map((card) => (
        <FloatingCard
          key={card.id}
          card={card}
          ref={(el) => registerCardElement(card.id, el)}
          onClick={() => handleCardClick(card)}
          dimmed={!!activeCategory && card.category !== activeCategory}
          hidden={expandedCard?.card.id === card.id}
        />
      ))}

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
