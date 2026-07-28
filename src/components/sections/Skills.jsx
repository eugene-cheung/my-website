import { motion } from 'framer-motion';
import { cards } from '../../data/resumeData';
import Section from '../Section';
import { FlipTile } from '../Tile';
import './sections.css';

const ease = [0.22, 1, 0.36, 1];

// The Four Gentlemen (四君子) flower tiles, one per discipline.
const FLOWERS = {
  'skills-languages': { tile: 'mei', label: '梅 Plum' },
  'skills-frameworks': { tile: 'lan', label: '蘭 Orchid' },
  'skills-tools': { tile: 'zhu', label: '竹 Bamboo' },
  'skills-aiml': { tile: 'ju', label: '菊 Chrysanthemum' },
};

function Skills() {
  const items = cards.filter((c) => c.category === 'skills');

  return (
    <Section id="skills" zh="藝" en="Skills" note="The four gentlemen — 四君子">
      <div className="skills-grid">
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            className="paper-card skill-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease }}
          >
            <div className="skill-head">
              <FlipTile face={FLOWERS[item.id].tile} width={54} delay={0.15 + i * 0.1} />
              <div>
                <p className="card-wind">{FLOWERS[item.id].label}</p>
                <h3 className="card-heading skill-heading">{item.expanded.heading}</h3>
              </div>
            </div>
            <div className="skill-tags">
              {item.expanded.tags.map((t) => (
                <span key={t} className="skill-tag">{t}</span>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export default Skills;
