import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { safeStorage } from "./lib/safeStorage";
import App from './App.tsx';
import './index.css';

// Force clean-up any cached service workers and cache storage to prevent blank screen problems in the user's browser
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('Old Service Worker unregistered successfully.');
      });
    }
  }).catch((err) => {
    console.warn('Error fetching service worker registrations:', err);
  });
}

if ('caches' in window) {
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      return caches.delete(key).then(() => {
        console.log('Cleared cache storage:', key);
      });
    }));
  }).catch((err) => {
    console.warn('Error clearing caches:', err);
  });
}

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2>Algo deu errado.</h2>
          <details style={{ whiteSpace: 'pre-wrap', color: 'red' }}>
            {this.state.error && this.state.error.toString()}
          </details>
          <button 
            onClick={() => {
              safeStorage.clear();
              window.location.reload();
            }}
            style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}
          >
            Limpar Dados e Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
