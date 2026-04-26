import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/resumeData';
import './ExpandedCard.css';

function getAnimationProps(fromRect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fromCenterX = fromRect.x + fromRect.width / 2;
  const fromCenterY = fromRect.y + fromRect.height / 2;
  const offsetX = fromCenterX - vw / 2;
  const offsetY = fromCenterY - vh / 2;
  const angleDeg = (fromRect.angle || 0) * (180 / Math.PI);

  return {
    initial: { x: offsetX, y: offsetY, scale: 0.35, rotate: angleDeg, opacity: 0.6 },
    animate: {
      x: 0, y: 0, scale: 1, rotate: 0, opacity: 1,
      transition: { type: 'spring', damping: 28, stiffness: 220 },
    },
    exit: {
      x: offsetX, y: offsetY, scale: 0.15, rotate: angleDeg + 3, opacity: 0,
      transition: { duration: 0.28, ease: [0.36, 0, 0.98, 0.28] },
    },
  };
}

function ExpandedCard({ cardData, fromRect, onClose }) {
  const cat = CATEGORIES[cardData.category];
  const data = cardData.expanded;
  const anim = getAnimationProps(fromRect);
  const maxW = Math.min(600, window.innerWidth - 48);

  const overlayProps = {
    className: 'ex-overlay',
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
    onClick: onClose,
  };

  if (cardData.isQuote) {
    return (
      <motion.div {...overlayProps}>
        <motion.div className="ex-card ex-card--quote" style={{ maxWidth: maxW }} {...anim} onClick={(e) => e.stopPropagation()}>
          <button className="ex-close" onClick={onClose} aria-label="Close">&times;</button>
          <p className="ex-qt">&ldquo;{cardData.quoteText}&rdquo;</p>
          <p className="ex-qa">&mdash; {cardData.quoteAuthor}</p>
        </motion.div>
      </motion.div>
    );
  }

  if (cardData.isPhoto || !data) {
    return (
      <motion.div {...overlayProps}>
        <motion.div className="ex-card ex-card--photo" {...anim} onClick={(e) => e.stopPropagation()}>
          <button className="ex-close" onClick={onClose} aria-label="Close">&times;</button>
          <div className="ex-photo-ph">
            <span className="ex-photo-icon">+</span>
            <span>Drop your image file into the project</span>
            <span className="ex-photo-hint">Replace placeholder in resumeData.js</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div {...overlayProps}>
      <motion.div className="ex-card" style={{ maxWidth: maxW, borderColor: cat.color + '25' }} {...anim} onClick={(e) => e.stopPropagation()}>
        <button className="ex-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="ex-accent-bar" style={{ backgroundColor: cat.color }} />

        <span className="ex-category" style={{ color: cat.color }}>{cat.label}</span>
        <h2 className="ex-heading">
          {data.headingUrl ? (
            <a
              href={data.headingUrl}
              className="ex-heading-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {data.heading}
            </a>
          ) : (
            data.heading
          )}
        </h2>
        {data.subheading && <h3 className="ex-subheading">{data.subheading}</h3>}
        {data.meta && <p className="ex-meta">{data.meta}</p>}

        {data.bullets && (
          <ul className="ex-bullets">
            {data.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}

        {data.tags && (
          <div className="ex-tags">
            {data.tags.map((t, i) => (
              <span key={i} className="ex-tag" style={{ borderColor: cat.color + '50', color: cat.color }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {data.links && (
          <div className="ex-links">
            {data.links.map((l, i) => (
              <div key={i} className="ex-link-row">
                <span className="ex-link-label">{l.label}</span>
                {l.url ? (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="ex-link">
                    {l.text}
                  </a>
                ) : (
                  <span className="ex-link-text">{l.text}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {data.description && <p className="ex-description">{data.description}</p>}
      </motion.div>
    </motion.div>
  );
}

export default ExpandedCard;
