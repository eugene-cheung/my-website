import { useState, useEffect, useCallback } from 'react';
import NavBar from './components/NavBar';
import Carousel from './components/Carousel';
import MobileLayout from './components/MobileLayout';
import ResumeModal from './components/ResumeModal';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const openResume = useCallback(() => setResumeOpen(true), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  return (
    <div className="app">
      <NavBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isMobile={isMobile}
        onResumeClick={openResume}
      />
      {isMobile ? (
        <MobileLayout activeCategory={activeCategory} />
      ) : (
        <Carousel activeCategory={activeCategory} />
      )}
      <ResumeModal open={resumeOpen} onClose={closeResume} />
    </div>
  );
}

export default App;
