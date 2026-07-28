import { motion } from 'framer-motion';
import './Tile.css';

export const tileSrc = (name) => `${import.meta.env.BASE_URL}tiles/${name}.svg`;

/** A static mahjong tile with a jade base edge. Width comes from the
 *  `width` prop or, when omitted, from the caller's CSS class. */
export function Tile({ face, width, className = '', style }) {
  return (
    <div
      className={`mj-tile ${className}`}
      style={{ width, ...style }}
    >
      <img src={tileSrc(face)} alt="" draggable="false" />
    </div>
  );
}

const flipVariants = {
  down: { rotateY: 180 },
  up: { rotateY: 0 },
};

/**
 * A tile that starts face-down (jade back) and flips face-up
 * when it scrolls into view.
 */
export function FlipTile({ face, width = 64, delay = 0, className = '' }) {
  return (
    <motion.div
      className={`mj-flip ${className}`}
      style={{ width }}
      initial="down"
      whileInView="up"
      viewport={{ once: true, margin: '-60px' }}
    >
      <motion.div
        className="mj-flip-inner"
        variants={flipVariants}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mj-tile mj-flip-face mj-flip-front">
          <img src={tileSrc(face)} alt="" draggable="false" />
        </div>
        <div className="mj-tile mj-flip-face mj-flip-back">
          <img src={tileSrc('face-down')} alt="" draggable="false" />
        </div>
      </motion.div>
    </motion.div>
  );
}
