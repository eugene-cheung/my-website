import { motion } from 'framer-motion';
import { Tile } from './Tile';
import './Footer.css';

const ease = [0.22, 1, 0.36, 1];

// A complete winning hand: three runs, a triplet of east winds, a pair of red dragons.
const WINNING_HAND = [
  'wan-1', 'wan-2', 'wan-3',
  'tiao-4', 'tiao-5', 'tiao-6',
  'bing-7', 'bing-8', 'bing-9',
  'east', 'east', 'east',
  'red', 'red',
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <motion.p
          className="footer-call"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        >
          和 <span className="footer-call-en">— a winning hand</span>
        </motion.p>
        <div className="footer-hand" aria-hidden="true">
          {WINNING_HAND.map((face, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease }}
            >
              <Tile face={face} className="footer-tile" />
            </motion.div>
          ))}
        </div>
        <p className="footer-line">
          © {new Date().getFullYear()} Eugene Cheung · Tiles from{' '}
          <a href="https://github.com/eugene-cheung/mahjong-table" target="_blank" rel="noreferrer">
            mahjong-table
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
