import { motion } from 'framer-motion';
import { cards } from '../../data/resumeData';
import Section from '../Section';
import { FlipTile } from '../Tile';
import './sections.css';

const ease = [0.22, 1, 0.36, 1];

const DRAGONS = {
  'hobby-valorant': { tile: 'red', label: '中 Red Dragon' },
  'hobby-chess': { tile: 'white', label: '白 White Dragon' },
};

function Hobbies() {
  const items = cards.filter((c) => c.category === 'hobbies');

  return (
    <Section id="hobbies" zh="閒" en="Off the Table" note="The dragon tiles — 中・白">
      <div className="hobby-grid">
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            className="paper-card hobby-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.12, ease }}
          >
            <FlipTile face={DRAGONS[item.id].tile} width={60} delay={0.15 + i * 0.12} />
            <p className="card-wind">{DRAGONS[item.id].label}</p>
            <h3 className="card-heading">{item.expanded.heading}</h3>
            <p className="card-sub hobby-desc">{item.expanded.description}</p>
            {item.expanded.links?.map((l) => (
              <a
                key={l.url}
                className="hobby-link"
                href={l.url}
                target="_blank"
                rel="noreferrer"
              >
                {l.text} ↗
              </a>
            ))}
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export default Hobbies;
