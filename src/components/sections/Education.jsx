import { motion } from 'framer-motion';
import { cards } from '../../data/resumeData';
import Section from '../Section';
import { FlipTile } from '../Tile';
import './sections.css';

const ease = [0.22, 1, 0.36, 1];

const WINDS = {
  'edu-uw': { tile: 'west', label: '西 West Wind' },
  'edu-uiuc': { tile: 'east', label: '東 East Wind' },
};

const ORDER = ['edu-uw', 'edu-uiuc'];

function Education() {
  const items = ORDER.map((id) => cards.find((c) => c.id === id));

  return (
    <Section id="education" zh="學" en="Education" note="From the west wind to the east">
      <div className="edu-grid">
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            className="paper-card edu-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.15, ease }}
          >
            <FlipTile face={WINDS[item.id].tile} width={72} delay={0.2 + i * 0.2} />
            <div className="edu-text">
              <p className="card-wind">{WINDS[item.id].label}</p>
              <h3 className="card-heading">{item.expanded.heading}</h3>
              <p className="card-sub">{item.expanded.subheading}</p>
              <p className="card-meta">{item.expanded.meta}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export default Education;
