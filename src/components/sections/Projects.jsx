import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cards } from '../../data/resumeData';
import Section from '../Section';
import { Tile } from '../Tile';
import './sections.css';

const ease = [0.22, 1, 0.36, 1];
const TIAO = ['tiao-1', 'tiao-5', 'tiao-9'];

function Projects() {
  const items = cards.filter((c) => c.category === 'projects');
  const [selected, setSelected] = useState(0);
  const active = items[selected];

  return (
    <Section id="projects" zh="作" en="Projects" note="Pick a tile from the rack — 條子">
      <div className="proj-rack" role="tablist" aria-label="Projects">
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            role="tab"
            aria-selected={selected === i}
            className={`proj-pick ${selected === i ? 'is-active' : ''}`}
            onClick={() => setSelected(i)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.12, ease }}
          >
            <Tile face={TIAO[i]} className="proj-tile" />
            <span className="proj-pick-label">{item.title}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.article
          key={active.id}
          className="paper-card proj-detail"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease }}
        >
          <div className="proj-detail-head">
            <h3 className="card-heading">
              {active.expanded.headingUrl ? (
                <a href={active.expanded.headingUrl} target="_blank" rel="noreferrer">
                  {active.expanded.heading} ↗
                </a>
              ) : (
                active.expanded.heading
              )}
            </h3>
            <p className="card-meta">{active.expanded.meta}</p>
          </div>
          <p className="card-sub">{active.expanded.subheading}</p>
          <ul className="card-bullets">
            {active.expanded.bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
        </motion.article>
      </AnimatePresence>
    </Section>
  );
}

export default Projects;
