import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Callback from './components/Callback';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/callback?*" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} /> {/* This will catch any undefined routes */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;