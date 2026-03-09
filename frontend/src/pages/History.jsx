import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/Layout'
import MoodModal from '../components/MoodModal'
import { selectionsApi, moodsApi } from '../api'

const LIMIT = 10

export default function History() {
  const [selections, setSelections] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await selectionsApi.getHistory({ page: p, limit: LIMIT })
      setSelections(res.data.data)
      setTotal(res.data.total)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory(1)
  }, [fetchHistory])

  const handleMoodSave = async (moodData) => {
    if (selected.mood) {
      await moodsApi.update(selected.mood.id, moodData)
    } else {
      await moodsApi.create({ selection_id: selected.id, ...moodData })
    }
    setSelected(null)
    fetchHistory(page)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <Layout>
      <h1 className="text-2xl font-extrabold text-pink-400 mb-6">📅 Historial</h1>

      {loading ? (
        <div className="text-center py-24 text-pink-200 font-semibold">Cargando...</div>
      ) : selections.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <p className="text-5xl mb-3">🌸</p>
          <p className="font-semibold">Aún no hay selecciones registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {selections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div
                className="w-11 h-11 rounded-full flex-shrink-0 shadow-md border-2 border-white"
                style={{ backgroundColor: s.uniform.hex_color }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-700 truncate">{s.uniform.name}</p>
                <p className="text-xs text-gray-400">
                  {s.day_of_week} ·{' '}
                  {new Date(s.selected_date + 'T00:00:00').toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex-shrink-0">
                {s.mood ? (
                  <span className="text-2xl">{s.mood.mood_emoji}</span>
                ) : (
                  <span className="text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded-full border border-dashed border-gray-200">
                    + mood
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => fetchHistory(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 rounded-full bg-white shadow text-pink-400 font-bold disabled:opacity-30 hover:bg-pink-50 transition-colors"
          >
            ←
          </button>
          <span className="text-sm text-gray-400 font-semibold">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => fetchHistory(page + 1)}
            disabled={page >= totalPages}
            className="w-9 h-9 rounded-full bg-white shadow text-pink-400 font-bold disabled:opacity-30 hover:bg-pink-50 transition-colors"
          >
            →
          </button>
        </div>
      )}

      {selected && (
        <MoodModal
          selection={selected}
          onSave={handleMoodSave}
          onClose={() => setSelected(null)}
        />
      )}
    </Layout>
  )
}
