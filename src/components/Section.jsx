import { motion } from 'framer-motion';
import './Section.css';

const ease = [0.22, 1, 0.36, 1];

function Section({ id, zh, en, note, children }) {
  return (
    <section id={id} className="section">
      <motion.header
        className="section-head"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease }}
      >
        <span className="section-zh" aria-hidden="true">{zh}</span>
        <div className="section-titles">
          <h2 className="section-en">{en}</h2>
          {note && <p className="section-note">{note}</p>}
        </div>
      </motion.header>
      <motion.div
        className="section-brushline"
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, delay: 0.15, ease }}
      />
      <div className="section-body">{children}</div>
    </section>
  );
}

export default Section;
