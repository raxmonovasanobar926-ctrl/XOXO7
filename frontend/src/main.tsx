import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { SocketProvider } from './contexts/SocketContext.tsx';
import { setupFetchInterceptor } from './config/api.ts';
import './i18n/index.ts';
import './styles/index.css';

// Initialize backend routing for Netlify deployment
setupFetchInterceptor();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeLanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </ThemeLanguageProvider>
  </React.StrictMode>,
);
