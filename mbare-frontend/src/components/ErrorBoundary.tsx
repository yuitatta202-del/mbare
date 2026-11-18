
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

// ==========================================
// MBARE - ERROR BOUNDARY
// React + Vite + TypeScript
// ==========================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ==========================================
// COMPONENT
// ==========================================

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  /**
   * Intercetta gli errori durante il rendering
   * dei componenti figli.
   */
  public static getDerivedStateFromError(
    error: Error
  ): Partial<ErrorBoundaryState> {

    return {
      hasError: true,
      error
    };
  }

  /**
   * Registra l'errore per il debugging.
   */
  public componentDidCatch(
    error: Error,
    errorInfo: ErrorInfo
  ): void {

    if (import.meta.env.DEV) {
      console.error(
        '[MBARE ErrorBoundary]',
        error,
        errorInfo
      );
    }

    this.setState({
      errorInfo
    });

    // In futuro: invio errori a un servizio
    // di monitoraggio, senza dati sensibili.
  }

  /**
   * Reimposta lo stato del componente.
   */
  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Torna alla homepage.
   */
  private handleGoHome = (): void => {
    window.location.assign('/');
  };

  /**
   * Ricarica completamente l'applicazione.
   */
  private handleReload = (): void => {
    window.location.reload();
  };

  // ==========================================
  // RENDER
  // ==========================================

  public render(): ReactNode {

    const {
      hasError,
      error,
      errorInfo
    } = this.state;

    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    // Permette un fallback personalizzato.
    if (fallback !== undefined) {
      return fallback;
    }

    return (
      <main
        role="alert"
        className="
          min-h-screen
          flex flex-col
          items-center justify-center
          bg-mbare-black
          text-mbare-white
          px-6 py-16
          text-center
        "
      >
        <div className="w-full max-w-2xl">

          {/* CODICE ERRORE */}
          <div className="mb-6">
            <span className="
              inline-block
              border border-mbare-accent
              px-4 py-2
              text-mbare-accent
              font-mono text-xs
              font-bold uppercase
              tracking-[0.2em]
            ">
              MBARE / SYSTEM ERROR
            </span>
          </div>

          {/* TITOLO */}
          <h1 className="
            text-7xl md:text-9xl
            font-display font-black
            uppercase leading-none
            text-mbare-accent
            mb-6
          ">
            OPS!
          </h1>

          {/* MESSAGGIO */}
          <h2 className="
            text-xl md:text-3xl
            font-display font-bold
            uppercase
            mb-4
          ">
            Qualcosa è andato storto.
          </h2>

          <p className="
            text-mbare-muted
            font-mono
            text-sm md:text-base
            leading-relaxed
            max-w-lg mx-auto
          ">
            Minchia! Pare che qualcosa si sia
            inceppato.

            <span className="block mt-3">
              Nessun problema, puoi provare
              a ripristinare la pagina oppure
              tornare alla home.
            </span>
          </p>

          {/* PULSANTI */}
          <div className="
            flex flex-col sm:flex-row
            items-center justify-center
            gap-3 mt-10
          ">

            <button
              type="button"
              onClick={this.handleRetry}
              className="
                w-full sm:w-auto
                bg-mbare-accent
                text-black
                px-7 py-3
                font-mono font-bold
                text-xs uppercase
                tracking-wider
                hover:bg-white
                transition-colors
              "
            >
              Riprova
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="
                w-full sm:w-auto
                border-2 border-mbare-border
                text-mbare-white
                px-7 py-3
                font-mono font-bold
                text-xs uppercase
                tracking-wider
                hover:border-mbare-accent
                hover:text-mbare-accent
                transition-colors
              "
            >
              Ricarica pagina
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              className="
                w-full sm:w-auto
                border-2 border-mbare-border
                text-mbare-muted
                px-7 py-3
                font-mono font-bold
                text-xs uppercase
                tracking-wider
                hover:text-white
                hover:border-white
                transition-colors
              "
            >
              Torna alla Home
            </button>

          </div>

          {/* DEBUG SOLO IN SVILUPPO */}
          {import.meta.env.DEV && error && (
            <details className="
              mt-12
              text-left
              border border-mbare-border
              bg-mbare-surface
              p-5
            ">
              <summary className="
                cursor-pointer
                text-mbare-accent
                font-mono text-xs
                uppercase font-bold
              ">
                Dettagli tecnici (Development)
              </summary>

              <div className="
                mt-4
                max-h-72
                overflow-auto
                text-xs
                font-mono
                text-red-400
              ">
                <p className="font-bold mb-3 break-words">
                  {error.name}: {error.message}
                </p>

                {error.stack && (
                  <pre className="whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                )}

                {errorInfo?.componentStack && (
                  <pre className="mt-4 whitespace-pre-wrap break-words">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}

          {/* FOOTER */}
          <div className="
            mt-12 pt-6
            border-t border-mbare-border
          ">
            <p className="
              text-mbare-muted
              font-mono text-[10px]
              uppercase tracking-[0.25em]
            ">
              MBARE — La casa degli studenti
            </p>
          </div>

        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
