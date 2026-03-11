import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeroUpload from './components/HeroUpload';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="OpinionIQ Logo" className="h-10 w-auto rounded" />
            </div>
            <div className="flex space-x-8">
              <Link to="/" className="text-slate-300 hover:text-white hover:text-indigo-400 transition-colors">Upload</Link>
              <Link to="/dashboard" className="text-slate-300 hover:text-white hover:text-indigo-400 transition-colors">Dashboard</Link>
              <Link to="/chat" className="text-slate-300 hover:text-white hover:text-indigo-400 transition-colors">Chat</Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HeroUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatInterface />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
