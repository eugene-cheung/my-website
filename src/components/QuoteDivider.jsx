import { motion } from 'framer-motion';
import './QuoteDivider.css';

function QuoteDivider({ text, author }) {
  return (
    <motion.figure
      className="quote-divider"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <blockquote>
        <span className="quote-bracket" aria-hidden="true">「</span>
        {text}
        <span className="quote-bracket" aria-hidden="true">」</span>
      </blockquote>
      <figcaption>— {author}</figcaption>
    </motion.figure>
  );
}

export default QuoteDivider;
