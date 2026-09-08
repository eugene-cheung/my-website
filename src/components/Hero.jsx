import { motion, useScroll, useTransform } from 'framer-motion';
import { Tile } from './Tile';
import './Hero.css';

const ease = [0.22, 1, 0.36, 1];

// The wall doubles as navigation: face-up tiles link to their sections.
const WALL = [
  { face: 'face-down' },
  { face: 'east', to: 'education', label: 'Education' },
  { face: 'face-down' },
  { face: 'wan-1', to: 'experience', label: 'Experience' },
  { face: 'face-down' },
  { face: 'tiao-1', to: 'projects', label: 'Projects' },
  { face: 'face-down' },
  { face: 'mei', to: 'skills', label: 'Skills' },
  { face: 'face-down' },
  { face: 'red', to: 'hobbies', label: 'Hobbies' },
  { face: 'face-down' },
  { face: 'bing-1', to: 'contact', label: 'Contact' },
  { face: 'face-down' },
];

function Mountains({ y1, y2 }) {
  return (
    <div className="hero-mountains" aria-hidden="true">
      <motion.svg
        style={{ y: y1 }}
        className="hero-range hero-range-far"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,320 L0,208 C96,176 168,120 264,132 C360,144 420,220 540,208 C660,196 726,96 840,88 C954,80 1020,172 1140,180 C1260,188 1330,140 1440,116 L1440,320 Z"
          fill="url(#farGrad)"
        />
        <defs>
          <linearGradient id="farGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fa38a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8fa38a" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </motion.svg>
      <motion.svg
        style={{ y: y2 }}
        className="hero-range hero-range-near"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          d="M0,320 L0,256 C120,240 200,168 320,180 C440,192 500,268 620,260 C740,252 830,148 960,140 C1090,132 1180,232 1300,244 C1360,250 1400,240 1440,232 L1440,320 Z"
          fill="url(#nearGrad)"
        />
        <defs>
          <linearGradient id="nearGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#41604a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#41604a" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </motion.svg>
      <div className="hero-mist" />
    </div>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 90]);
  const y2 = useTransform(scrollY, [0, 600], [0, 40]);

  return (
    <header className="hero">
      <Mountains y1={y1} y2={y2} />

      <div className="hero-poem" aria-hidden="true">
        <span>玉不琢，不成器</span>
        <span>人不學，不知義</span>
      </div>

      <div className="hero-content">
        <motion.p
          className="hero-kicker"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
        >
          Software Engineer · ML Researcher
        </motion.p>

        <div className="hero-name-row">
          <motion.h1
            className="hero-name"
            initial={{ clipPath: 'inset(0 100% -20% 0)' }}
            animate={{ clipPath: 'inset(0 0% -20% 0)' }}
            transition={{ duration: 1.1, delay: 0.35, ease }}
          >
            Eugene Cheung
          </motion.h1>
          <div className="hero-signature" aria-label="張堯鈞">
            <motion.span
              className="hero-sig-name"
              aria-hidden="true"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.2, ease }}
            >
              張堯鈞
            </motion.span>
            <motion.span
              className="hero-seal"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 1.7, rotate: 4 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ duration: 0.45, delay: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              張
            </motion.span>
          </div>
        </div>

        <motion.p
          className="hero-lede"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease }}
        >
          Building agentic systems, data pipelines, and expressing my
          hobbies through tech — from Seattle and Urbana-Champaign.
        </motion.p>
      </div>

      <nav className="hero-wall" aria-label="Sections">
        {WALL.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.055, ease }}
          >
            {t.to ? (
              <a className="hero-wall-link" href={`#${t.to}`}>
                <span className="hero-wall-tip">{t.label}</span>
                <Tile face={t.face} className="hero-wall-tile" />
              </a>
            ) : (
              <Tile face={t.face} className="hero-wall-tile" />
            )}
          </motion.div>
        ))}
      </nav>

      <motion.div
        className="hero-scrollcue"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 1 }}
      >
        <span className="hero-scrollcue-text">Scroll</span>
        <span className="hero-scrollcue-track">
          <motion.span
            className="hero-scrollcue-line"
            animate={{ scaleY: [0, 1, 1, 0], originY: [0, 0, 1, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, times: [0, 0.45, 0.7, 1], ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </header>
  );
}

export default Hero;
