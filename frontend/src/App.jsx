import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Generator from './pages/Generator.jsx'
import Gallery from './pages/Gallery.jsx'
import ViewPage from './pages/ViewPage.jsx'
export default function App() {
  const location = useLocation()
  const isViewRoute = location.pathname === '/view'

  if (isViewRoute) {
    return (
      <Routes>
        <Route path="/view" element={<ViewPage />} />
      </Routes>
    )
  }

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <a href="/" className="navbar-brand">
            <span className="logo-mark">⬡</span>
            PageForge
          </a>
          <ul className="navbar-links">
            <li>
              <NavLink to="/" end>
                Generator
              </NavLink>
            </li>
            <li>
              <NavLink to="/gallery">
                Gallery
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Generator />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>
    </>
  )
}
