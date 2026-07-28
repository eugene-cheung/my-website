import { useState, useCallback } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Education from './components/sections/Education';
import Experience from './components/sections/Experience';
import Projects from './components/sections/Projects';
import Skills from './components/sections/Skills';
import Hobbies from './components/sections/Hobbies';
import Contact from './components/sections/Contact';
import QuoteDivider from './components/QuoteDivider';
import Footer from './components/Footer';
import ResumeModal from './components/ResumeModal';
import { cards } from './data/resumeData';

const quotes = cards.filter((c) => c.isQuote);

function App() {
  const [resumeOpen, setResumeOpen] = useState(false);
  const openResume = useCallback(() => setResumeOpen(true), []);
  const closeResume = useCallback(() => setResumeOpen(false), []);

  return (
    <div id="top">
      <Nav onResumeClick={openResume} />
      <main>
        <Hero />
        <Education />
        <QuoteDivider text={quotes[3].quoteText} author={quotes[3].quoteAuthor} />
        <Experience />
        <QuoteDivider text={quotes[1].quoteText} author={quotes[1].quoteAuthor} />
        <Projects />
        <Skills />
        <QuoteDivider text={quotes[2].quoteText} author={quotes[2].quoteAuthor} />
        <Hobbies />
        <QuoteDivider text={quotes[0].quoteText} author={quotes[0].quoteAuthor} />
        <Contact />
      </main>
      <Footer />
      <ResumeModal open={resumeOpen} onClose={closeResume} />
    </div>
  );
}

export default App;
