
import './App.css'
import { Link, Route, Routes } from 'react-router-dom'

function App() {

  return (
    <section id="center" className="p-8">
      <div className="text-center space-y-6">
        <nav className="flex items-center justify-center gap-4">
          <Link to="/" className="text-blue-600 underline">Inicio</Link>
          <Link to="/about" className="text-blue-600 underline">Acerca</Link>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<h1 className="text-3xl font-bold underline">Home</h1>}
          />
          <Route
            path="/about"
            element={<h1 className="text-3xl font-bold underline">About</h1>}
          />
        </Routes>
      </div>
    </section>
  )
}

export default App
