import React from 'react';
import AdCanvas from './components/Canvas/AdCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <AdCanvas />
      </main>
    </div>
  );
}

export default App;
