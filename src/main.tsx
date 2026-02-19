import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import OverlayApp from './OverlayApp';
import './index.css';

// Route to the correct window based on URL pathname.
// tauri.conf.json sets "url": "/" for control and "url": "/overlay" for the overlay window.
const isOverlay = window.location.pathname === '/overlay';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isOverlay ? <OverlayApp /> : <App />}
  </React.StrictMode>
);
