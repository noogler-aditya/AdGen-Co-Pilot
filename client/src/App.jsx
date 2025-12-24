import React from 'react';
import AdCanvas from './components/Canvas/AdCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import ProductTour from './components/Onboarding/Onboarding';
import './index.css';

function App() {
  return (
    <>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <AdCanvas />
        </main>
      </div>
      <ProductTour />
    </>
  );
}

export default App;
