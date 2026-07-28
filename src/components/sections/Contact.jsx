import { motion } from 'framer-motion';
import { cards } from '../../data/resumeData';
import Section from '../Section';
import './sections.css';

const ease = [0.22, 1, 0.36, 1];

function Contact() {
  const contact = cards.find((c) => c.id === 'contact');
  const links = contact.expanded.links.filter((l) => l.label !== 'Website');

  return (
    <Section id="contact" zh="信" en="Get in Touch" note="Letters always welcome">
      <motion.div
        className="paper-card contact-card"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease }}
      >
        <motion.span
          className="contact-seal"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.6, rotate: 6 }}
          whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          張
        </motion.span>
        <dl className="contact-list">
          {links.map((l) => (
            <div key={l.label} className="contact-row">
              <dt>{l.label}</dt>
              <dd>
                {l.url ? <a href={l.url}>{l.text}</a> : <span>{l.text}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </Section>
  );
}

export default Contact;
