import { CATEGORIES } from '../data/resumeData';
import './NavBar.css';

const categoryEntries = Object.entries(CATEGORIES);

function NavBar({ activeCategory, onCategoryChange, onShuffle }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-name">Eugene Cheung</span>
      </div>

      <div className="navbar-cats">
        <button
          className={`navbar-btn${!activeCategory ? ' active' : ''}`}
          onClick={() => onCategoryChange(null)}
        >
          All
        </button>
        {categoryEntries.map(([key, cat]) => (
          <button
            key={key}
            className={`navbar-btn${activeCategory === key ? ' active' : ''}`}
            style={activeCategory === key ? { color: cat.color, borderColor: cat.color } : undefined}
            onClick={() => onCategoryChange(activeCategory === key ? null : key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="navbar-actions">
        <button className="navbar-shuffle" onClick={onShuffle} title="Mix it up!">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 3 21 3 21 8" />
            <line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" />
            <line x1="15" y1="15" x2="21" y2="21" />
            <line x1="4" y1="4" x2="9" y2="9" />
          </svg>
          <span>Mix up</span>
        </button>
        <a className="navbar-resume" href="/resume.pdf" target="_blank" rel="noopener noreferrer">
          Resume &darr;
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
