// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center bg-mbare-black">
          <h1 className="text-6xl font-display font-bold text-mbare-accent uppercase">Ops!</h1>
          <p className="text-xl text-mbare-white font-mono mt-4">
            Qualcosa è andato storto. Minchia.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-8 bg-mbare-white text-mbare-black px-6 py-3 font-bold uppercase hover:bg-mbare-accent hover:text-white transition-colors"
          >
            Ricarica la pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;