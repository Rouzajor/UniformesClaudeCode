import { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import Layout from '../components/Layout'
import { uniformsApi } from '../api'

export default function Uniforms() {
  const [uniforms, setUniforms] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#F4A7B9')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const res = await uniformsApi.getAll()
    setUniforms(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await uniformsApi.create({ name: name.trim(), hex_color: color })
      setName('')
      setColor('#F4A7B9')
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id) => {
    await uniformsApi.deactivate(id)
    load()
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-pink-400">🎨 Mis Colores</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-full text-sm font-bold shadow transition-colors"
        >
          {showForm ? '✕ Cancelar' : '+ Agregar'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-3xl shadow-sm p-6 mb-6"
        >
          <p className="text-sm font-bold text-gray-500 mb-5">Nuevo color de uniforme</p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <HexColorPicker color={color} onChange={setColor} style={{ width: '100%', maxWidth: '200px' }} />
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full shadow-md border-2 border-white flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre (ej: Azul cielo)"
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 font-medium"
                  required
                />
              </div>
              <p className="text-xs text-gray-300 font-mono pl-1">Hex: {color}</p>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="w-full py-3 bg-pink-400 hover:bg-pink-500 disabled:opacity-40 text-white rounded-full text-sm font-bold transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar color'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {uniforms.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm"
          >
            <div
              className="w-12 h-12 rounded-full shadow-md border-2 border-white flex-shrink-0"
              style={{ backgroundColor: u.hex_color }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-700 truncate">{u.name}</p>
              <p className="text-xs text-gray-400 font-mono">{u.hex_color}</p>
            </div>
            <button
              onClick={() => handleDeactivate(u.id)}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors px-3 py-1.5 rounded-full border border-gray-100 hover:border-red-200 font-semibold whitespace-nowrap"
            >
              Desactivar
            </button>
          </div>
        ))}
        {uniforms.length === 0 && (
          <div className="text-center py-20 text-gray-300">
            <p className="text-5xl mb-3">🎨</p>
            <p className="font-semibold">No hay colores activos</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
