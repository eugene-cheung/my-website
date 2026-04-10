import { useState, useRef } from 'react';
import NavBar from './components/NavBar';
import PhysicsWorld from './components/PhysicsWorld';
import './App.css';

function App() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const shuffleRef = useRef(null);

  return (
    <div className="app">
      <NavBar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onShuffle={() => shuffleRef.current?.current?.()}
      />
      <PhysicsWorld
        activeCategory={activeCategory}
        expandedCard={expandedCard}
        setExpandedCard={setExpandedCard}
        onShuffleReady={(ref) => { shuffleRef.current = ref; }}
      />
    </div>
  );
}

export default App;
