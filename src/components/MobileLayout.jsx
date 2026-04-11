import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cards, CATEGORIES } from '../data/resumeData';
import ExpandedCard from './ExpandedCard';
import './MobileLayout.css';

const CATEGORY_ORDER = [
  'experience',
  'education',
  'projects',
  'skills',
  'contact',
  'quotes',
  'hobbies',
];

function MobileLayout({ activeCategory }) {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleCardClick = useCallback(
    (card) => {
      if (expandedCard) return;
      if (!card.expanded && !card.isQuote) return;
      setExpandedCard({
        card,
        fromRect: {
          x: window.innerWidth / 2 - 150,
          y: window.innerHeight / 2 - 100,
          width: 300,
          height: 200,
          angle: 0,
        },
      });
    },
    [expandedCard]
  );

  const handleClose = useCallback(() => setExpandedCard(null), []);

  const grouped = {};
  for (const card of cards) {
    if (card.isPhoto) continue;
    if (activeCategory && card.category !== activeCategory) continue;
    if (!grouped[card.category]) grouped[card.category] = [];
    grouped[card.category].push(card);
  }

  return (
    <div className="mobile-layout">
      {CATEGORY_ORDER.map((catKey) => {
        const catCards = grouped[catKey];
        if (!catCards || catCards.length === 0) return null;
        const cat = CATEGORIES[catKey];

        return (
          <section key={catKey} className="mobile-section">
            <h2
              className="mobile-section-title"
              style={{ color: cat.color }}
            >
              {cat.label}
            </h2>
            {catCards.map((card) => (
              <div
                key={card.id}
                className={`mobile-card${card.expanded || card.isQuote ? ' mobile-card--clickable' : ''}`}
                onClick={() => handleCardClick(card)}
              >
                <div
                  className="mobile-card-accent"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="mobile-card-content">
                  {card.isQuote ? (
                    <>
                      <p className="mobile-card-quote">
                        &ldquo;{card.quoteText}&rdquo;
                      </p>
                      <p className="mobile-card-author">
                        &mdash; {card.quoteAuthor}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="mobile-card-title">{card.title}</h3>
                      {card.subtitle && (
                        <p className="mobile-card-subtitle">
                          {card.subtitle}
                        </p>
                      )}
                      {card.preview && (
                        <p className="mobile-card-preview">
                          {card.preview}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </section>
        );
      })}

      <AnimatePresence>
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

export default MobileLayout;
