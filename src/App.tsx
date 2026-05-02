import { ErrorFallback } from './components/ui/ErrorFallback'
import { AppProviders } from './app/providers'
import { AppRouter } from './app/router'

function App() {
  return (
    <ErrorFallback>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorFallback>
  )
}

export default App
