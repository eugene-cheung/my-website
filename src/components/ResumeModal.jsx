import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ResumeModal.css';

const RESUME_URL = `${import.meta.env.BASE_URL}Eugene_Cheung___Resume.pdf`;

function ResumeModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="resume-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="resume-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="resume-header">
              <h2 className="resume-title">Resume</h2>
              <div className="resume-actions">
                <a
                  className="resume-download"
                  href={RESUME_URL}
                  download="Eugene_Cheung_Resume.pdf"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v10m0 0L4.5 7.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download
                </a>
                <button className="resume-close" onClick={onClose}>
                  &times;
                </button>
              </div>
            </div>
            <div className="resume-embed-wrap">
              <iframe
                className="resume-embed"
                src={`${RESUME_URL}#toolbar=0&navpanes=0`}
                title="Resume Preview"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ResumeModal;
