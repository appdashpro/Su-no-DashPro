import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { safeStorage } from "./lib/safeStorage";
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  try {
    registerSW({ immediate: true });
  } catch (e) {
    console.error('SW registration failed:', e);
  }
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
