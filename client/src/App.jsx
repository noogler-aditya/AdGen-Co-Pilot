import React, { useEffect } from 'react';
import AdCanvas from './components/Canvas/AdCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import ProductTour from './components/Onboarding/Onboarding';
import useAdStore from './store/useAdStore';
import './index.css';

function App() {
  const theme = useAdStore((state) => state.theme);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

