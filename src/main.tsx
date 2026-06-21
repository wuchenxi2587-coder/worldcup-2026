import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Apply saved theme on load
const saved = localStorage.getItem('wc2026-settings');
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (parsed.state?.settings?.theme) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch {}
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
