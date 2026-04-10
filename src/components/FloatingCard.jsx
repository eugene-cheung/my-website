import { forwardRef } from 'react';
import { CATEGORIES } from '../data/resumeData';
import './FloatingCard.css';

const FloatingCard = forwardRef(function FloatingCard({ card, onClick, dimmed, hidden }, ref) {
  const cat = CATEGORIES[card.category];

  if (card.isPhoto) {
    return (
      <div
        ref={ref}
        className={`floating-card floating-card--photo${dimmed ? ' dimmed' : ''}${hidden ? ' hidden' : ''}`}
        style={{ width: card.width, height: card.height }}
        onClick={onClick}
      >
        <div className="fc-photo-placeholder" style={{ borderColor: cat.color + '40' }}>
          <span className="fc-photo-plus">+</span>
          <span className="fc-photo-label">Photo</span>
        </div>
      </div>
    );
  }

  if (card.isQuote) {
    return (
      <div
        ref={ref}
        className={`floating-card floating-card--quote${dimmed ? ' dimmed' : ''}${hidden ? ' hidden' : ''}`}
        style={{ width: card.width, height: card.height }}
        onClick={onClick}
      >
        <div className="fc-accent" style={{ backgroundColor: cat.color }} />
        <div className="fc-content">
          <p className="fc-quote-text">&ldquo;{card.quoteText}&rdquo;</p>
          <p className="fc-quote-author">&mdash; {card.quoteAuthor}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`floating-card${dimmed ? ' dimmed' : ''}${hidden ? ' hidden' : ''}`}
      style={{ width: card.width, height: card.height }}
      onClick={onClick}
    >
      <div className="fc-accent" style={{ backgroundColor: cat.color }} />
      <div className="fc-content">
        <span className="fc-category" style={{ color: cat.color }}>{cat.label}</span>
        <h3 className="fc-title">{card.title}</h3>
        {card.subtitle && <p className="fc-subtitle">{card.subtitle}</p>}
        {card.preview && <p className="fc-preview">{card.preview}</p>}
      </div>
    </div>
  );
});

export default FloatingCard;
