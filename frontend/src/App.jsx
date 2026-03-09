import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import History from './pages/History'
import Stats from './pages/Stats'
import Uniforms from './pages/Uniforms'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<History />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/uniforms" element={<Uniforms />} />
    </Routes>
  )
}
