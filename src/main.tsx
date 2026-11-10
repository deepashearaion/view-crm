import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { installSessionExpiryHandler } from '@/features/auth';
import { paths } from '@/routes/paths';

import './styles/index.css';

// A 401 that a token refresh can't fix ends the session.
installSessionExpiryHandler(paths.signIn);

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
