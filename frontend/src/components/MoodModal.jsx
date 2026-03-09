import { useState } from 'react'

const MOODS = [
  { emoji: '😊', label: 'Feliz' },
  { emoji: '🥰', label: 'Relajada' },
  { emoji: '💪', label: 'Energética' },
  { emoji: '😴', label: 'Cansada' },
  { emoji: '😤', label: 'Estresada' },
  { emoji: '😢', label: 'Triste' },
  { emoji: '😐', label: 'Normal' },
  { emoji: '🤒', label: 'Enferma' },
]

export default function MoodModal({ selection, onSave, onClose }) {
  const existing = selection.mood
  const [picked, setPicked] = useState(
    existing ? MOODS.find((m) => m.emoji === existing.mood_emoji) ?? null : null
  )
  const [notes, setNotes] = useState(existing?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!picked) return
    setSaving(true)
    await onSave({ mood_emoji: picked.emoji, mood_label: picked.label, notes })
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-full shadow-md border-2 border-white"
            style={{ backgroundColor: selection.uniform.hex_color }}
          />
          <div>
            <p className="font-bold text-gray-700">{selection.uniform.name}</p>
            <p className="text-xs text-gray-400">
              {selection.day_of_week} ·{' '}
              {new Date(selection.selected_date + 'T00:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-500 mb-3">¿Cómo te sentiste ese día?</p>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {MOODS.map((m) => (
            <button
              key={m.emoji}
              onClick={() => setPicked(m)}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
                picked?.emoji === m.emoji
                  ? 'bg-pink-100 ring-2 ring-pink-300 scale-105'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs text-gray-400 mt-1 leading-tight text-center">
                {m.label}
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas del día... (opcional)"
          className="w-full border border-gray-200 rounded-2xl p-3 text-sm text-gray-600 resize-none focus:outline-none focus:ring-2 focus:ring-pink-200 placeholder-gray-300"
          rows={2}
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-gray-200 text-gray-400 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!picked || saving}
            className="flex-1 py-2.5 rounded-full bg-pink-400 text-white text-sm font-bold disabled:opacity-40 hover:bg-pink-500 transition-colors"
          >
            {saving ? 'Guardando...' : existing ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
