import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from '@posthog/react';
import App from './App';
import { posthog, captureEvent } from './lib/posthog';

// Custom styles (includes Tailwind + custom design system)
import './index.css';

// Ionic theme overrides
import './theme/variables.css';

captureEvent('app opened');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>
);
