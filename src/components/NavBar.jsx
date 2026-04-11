import { CATEGORIES } from '../data/resumeData';
import './NavBar.css';

const categoryEntries = Object.entries(CATEGORIES);

function NavBar({ activeCategory, onCategoryChange, isMobile }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-name">Eugene Cheung</span>
      </div>

      {!isMobile && (
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
              style={
                activeCategory === key
                  ? { color: cat.color, borderColor: cat.color }
                  : undefined
              }
              onClick={() =>
                onCategoryChange(activeCategory === key ? null : key)
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="navbar-actions">
        <a
          className="navbar-resume"
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume &darr;
        </a>
      </div>
    </nav>
  );
}

export default NavBar;
