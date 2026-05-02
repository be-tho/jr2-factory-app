import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorFallbackProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorFallbackState {
  hasError: boolean
  error: Error | null
}

export class ErrorFallback extends Component<ErrorFallbackProps, ErrorFallbackState> {
  constructor(props: ErrorFallbackProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorFallbackState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorFallback]', error, errorInfo.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-canvas p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-brand-ink">Algo salió mal</h2>
          <p className="mt-2 text-sm text-brand-ink-muted">
            Ocurrió un error inesperado. Si el problema persiste, contactá a soporte.
          </p>
          {this.state.error && (
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-brand-canvas p-3 text-left text-xs text-brand-ink-faint">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }
}
