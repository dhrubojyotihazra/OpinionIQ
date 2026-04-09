import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import HeroUpload from './components/HeroUpload';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import About from './components/About';
import Contact from './components/Contact';
import GradientMenu from './components/ui/gradient-menu';

/* ── Theme hook ──────────────────────────────────────────── */
function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const stored = localStorage.getItem('oiq-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('oiq-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}

/* ── Nav ─────────────────────────────────────────────────── */
const Nav: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent pointer-events-none pb-4 sm:pb-0 h-auto sm:h-[80px] pt-4 sm:pt-0">
      <div className="mx-auto flex flex-col sm:flex-row h-auto sm:h-full max-w-7xl items-center sm:justify-between px-2 sm:px-8 pointer-events-auto gap-4 sm:gap-0">
        {/* Brand - Logo on Top Left */}
        <Link to="/" className="flex items-center sm:mr-auto hover:opacity-80 transition-opacity shrink-0">
          <img src="/logo.png" alt="OpinionIQ" className="h-7 sm:h-8 md:h-10 lg:h-12 w-auto shrink-0 object-contain" />
        </Link>

        {/* Top Right: Nav */}
        <div className="flex items-center justify-center shrink-0">
          <GradientMenu />
        </div>
      </div>
    </nav>
  );
};

/* ── App ─────────────────────────────────────────────────── */
const App: React.FC = () => {
  useTheme();

  return (
    <Router>
      <div className="min-h-screen">
        <Nav />
        {/* The landing page is full-screen; give no padding-top so it fills behind the translucent nav */}
        <main>
          <Routes>
            <Route path="/" element={<HeroUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
