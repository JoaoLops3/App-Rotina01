import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Custom styles (includes Tailwind + custom design system)
import './index.css';

// Ionic theme overrides
import './theme/variables.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
