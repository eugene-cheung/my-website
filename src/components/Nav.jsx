import { useEffect, useState } from 'react';
import './Nav.css';

const LINKS = [
  { id: 'education', zh: '學', en: 'Education' },
  { id: 'experience', zh: '歷', en: 'Experience' },
  { id: 'projects', zh: '作', en: 'Projects' },
  { id: 'skills', zh: '藝', en: 'Skills' },
  { id: 'hobbies', zh: '閒', en: 'Hobbies' },
  { id: 'contact', zh: '信', en: 'Contact' },
];

function Nav({ onResumeClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <a className="nav-brand" href="#top" aria-label="Back to top">
        <span className="nav-seal" aria-hidden="true">張</span>
        <span className="nav-brand-name">Eugene Cheung</span>
      </a>
      <div className="nav-links">
        {LINKS.map((l) => (
          <a key={l.id} className="nav-link" href={`#${l.id}`}>
            <span className="nav-link-zh" aria-hidden="true">{l.zh}</span>
            <span className="nav-link-en">{l.en}</span>
          </a>
        ))}
        <button className="nav-resume" onClick={onResumeClick}>
          Résumé
        </button>
      </div>
    </nav>
  );
}

export default Nav;
