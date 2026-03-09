import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import Layout from '../components/Layout'
import { statsApi } from '../api'

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function EmptyState() {
  return (
    <p className="text-gray-300 text-sm text-center py-8 font-semibold">
      Sin datos aún 🌸
    </p>
  )
}

export default function Stats() {
  const [byColor, setByColor] = useState([])
  const [byWeekday, setByWeekday] = useState([])
  const [moodColor, setMoodColor] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([statsApi.byColor(), statsApi.byWeekday(), statsApi.moodColor()])
      .then(([c, w, m]) => {
        setByColor(
          c.data.map((r) => ({
            name: r.uniform.name,
            hex: r.uniform.hex_color,
            count: parseInt(r.count),
          }))
        )
        setByWeekday(
          w.data
            .map((r) => ({
              day: r.day_of_week,
              name: r.uniform.name,
              hex: r.uniform.hex_color,
              count: parseInt(r.count),
            }))
            .sort(
              (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
            )
        )
        // Group by mood_label
        const groups = {}
        for (const row of m.data) {
          const label = row.mood_label
          if (!groups[label]) groups[label] = []
          groups[label].push({
            name: row.selection.uniform.name,
            hex: row.selection.uniform.hex_color,
            count: parseInt(row.count),
          })
        }
        setMoodColor(groups)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-24 text-pink-200 font-semibold">Cargando...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-2xl font-extrabold text-pink-400 mb-6">📊 Estadísticas</h1>

      {/* Bar chart – most frequent colors */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-5">
        <h2 className="text-base font-bold text-gray-600 mb-4">Colores más frecuentes</h2>
        {byColor.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byColor} margin={{ left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(v) => [v, 'veces']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px #0001' }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {byColor.map((row, i) => (
                  <Cell key={i} fill={row.hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekday table */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-5">
        <h2 className="text-base font-bold text-gray-600 mb-4">
          Color favorito por día de semana
        </h2>
        {byWeekday.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-gray-50">
            {byWeekday.map((row) => (
              <div key={row.day} className="flex items-center gap-3 py-2.5">
                <span className="w-24 text-sm text-gray-400 font-semibold">{row.day}</span>
                <div
                  className="w-6 h-6 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: row.hex }}
                />
                <span className="text-sm text-gray-700 flex-1 font-medium">{row.name}</span>
                <span className="text-xs text-gray-300 font-semibold">{row.count}x</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mood-color correlation */}
      <div className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-600 mb-4">Color y emoción</h2>
        {Object.keys(moodColor).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {Object.entries(moodColor).map(([label, rows]) => (
              <div key={label} className="p-3 bg-pink-50 rounded-2xl">
                <p className="text-sm font-bold text-gray-600 mb-2">{label}</p>
                <div className="flex flex-wrap gap-2">
                  {rows.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: r.hex }}
                      />
                      <span className="text-xs text-gray-600 font-medium">{r.name}</span>
                      <span className="text-xs text-gray-300">{r.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
