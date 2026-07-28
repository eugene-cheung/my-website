import { motion } from 'framer-motion';
import { cards } from '../../data/resumeData';
import Section from '../Section';
import { FlipTile } from '../Tile';
import './sections.css';

const ease = [0.22, 1, 0.36, 1];
const WAN = ['wan-1', 'wan-2', 'wan-3'];

function Experience() {
  const items = cards.filter((c) => c.category === 'experience');

  return (
    <Section id="experience" zh="歷" en="Experience" note="Tiles drawn so far — 萬子">
      <div className="exp-timeline">
        {items.map((item, i) => (
          <motion.article
            key={item.id}
            className="exp-row"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="exp-tile-col">
              <FlipTile face={WAN[i]} width={64} delay={0.15} />
              {i < items.length - 1 && <span className="exp-thread" aria-hidden="true" />}
            </div>
            <div className="paper-card exp-card">
              <h3 className="card-heading">
                {item.expanded.headingUrl ? (
                  <a href={item.expanded.headingUrl} target="_blank" rel="noreferrer">
                    {item.expanded.heading}
                  </a>
                ) : (
                  item.expanded.heading
                )}
              </h3>
              <p className="card-sub">{item.expanded.subheading}</p>
              <p className="card-meta">{item.expanded.meta}</p>
              <ul className="card-bullets">
                {item.expanded.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

export default Experience;
