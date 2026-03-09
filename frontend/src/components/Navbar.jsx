import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: '🎡 Ruleta' },
  { to: '/history', label: '📅 Historial' },
  { to: '/stats', label: '📊 Stats' },
  { to: '/uniforms', label: '🎨 Colores' },
]

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <span className="text-xl font-extrabold text-pink-400 whitespace-nowrap">
          🌸 UniformesDía
        </span>
        <div className="flex gap-1 flex-wrap">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-pink-100 text-pink-600'
                    : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
