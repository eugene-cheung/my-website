import { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Carousel from './components/Carousel';
import MobileLayout from './components/MobileLayout';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="app">
      <NavBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        isMobile={isMobile}
      />
      {isMobile ? (
        <MobileLayout activeCategory={activeCategory} />
      ) : (
        <Carousel activeCategory={activeCategory} />
      )}
    </div>
  );
}

export default App;
