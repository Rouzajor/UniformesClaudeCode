import { useState, useEffect, useRef } from 'react'
import Confetti from 'react-confetti'
import Layout from '../components/Layout'
import { uniformsApi, selectionsApi } from '../api'

// ── helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const todayKey = () => new Date().toISOString().split('T')[0]
const LS_KEY = 'uniformes_roulette'

function loadSavedState() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.date !== todayKey()) return null
    return data
  } catch {
    return null
  }
}

function saveState(patch) {
  try {
    const current = loadSavedState() ?? { date: todayKey(), eliminationOrder: [] }
    localStorage.setItem(LS_KEY, JSON.stringify({ ...current, ...patch }))
  } catch {}
}

// ── TodayCard ────────────────────────────────────────────────────────────────

function TodayCard({ selection }) {
  const u = selection.uniform
  return (
    <div className="text-center py-12">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
        Hoy elegiste
      </p>
      <div
        className="w-36 h-36 rounded-full mx-auto my-4 shadow-xl border-4 border-white animate-winner-float"
        style={{ backgroundColor: u.hex_color }}
      />
      <h2 className="text-3xl font-extrabold text-gray-700 mt-2">{u.name}</h2>
      <p className="text-gray-400 mt-1 text-sm">{selection.day_of_week}</p>
      {selection.mood && <p className="text-4xl mt-4">{selection.mood.mood_emoji}</p>}
    </div>
  )
}

// ── UniformCard ──────────────────────────────────────────────────────────────

function UniformCard({ uniform, isExploding, isHighlighted }) {
  return (
    <div
      className={[
        'flex flex-col items-center p-4 rounded-2xl border-2 select-none',
        'transition-[transform,box-shadow,background-color] duration-200',
        isExploding
          ? 'animate-pop-explode border-transparent bg-white shadow-sm'
          : isHighlighted
          ? 'border-pink-400 bg-pink-50 shadow-lg animate-card-hot'
          : 'border-transparent bg-white shadow-sm hover:shadow-md',
      ].join(' ')}
    >
      <div
        className="w-14 h-14 rounded-full mb-2 shadow-md"
        style={{ backgroundColor: uniform.hex_color }}
      />
      <span className="text-xs text-gray-500 text-center font-semibold leading-tight">
        {uniform.name}
      </span>
    </div>
  )
}

// ── WinnerScreen ─────────────────────────────────────────────────────────────

function WinnerScreen({ winner }) {
  return (
    <div className="text-center py-6">
      <div className="text-5xl mb-3 animate-bounce">🎉</div>

      <p
        className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 animate-badge-in"
        style={{ animationDelay: '0.1s', opacity: 0 }}
      >
        ¡Tu color de hoy es!
      </p>

      {/* Winner circle with pulse ring */}
      <div className="relative inline-block my-4">
        <div
          className="w-44 h-44 rounded-full shadow-2xl border-4 border-white animate-winner-entrance animate-pulse-ring"
          style={{ backgroundColor: winner.hex_color }}
        />
      </div>

      <h2
        className="text-4xl font-extrabold text-gray-700 mt-4 animate-badge-in"
        style={{ animationDelay: '0.3s', opacity: 0 }}
      >
        {winner.name}
      </h2>
      <p
        className="text-gray-400 mt-2 text-sm animate-badge-in"
        style={{ animationDelay: '0.5s', opacity: 0 }}
      >
        {new Date().toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </p>
    </div>
  )
}

// ── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [uniforms, setUniforms] = useState([])
  const [todaySelection, setTodaySelection] = useState(null)

  // Roulette state
  const [eliminationOrder, setEliminationOrder] = useState([]) // ids, oldest→newest
  const [eliminated, setEliminated] = useState(new Set())
  const [exploding, setExploding] = useState(new Set())
  const [highlighted, setHighlighted] = useState(null)
  const [winner, setWinner] = useState(null)

  const [spinning, setSpinning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [loading, setLoading] = useState(true)
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  // Keep a ref for cancellation if component unmounts mid-spin
  const spinningRef = useRef(false)

  useEffect(() => {
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Load uniforms + today's selection + saved roulette state
  useEffect(() => {
    Promise.all([
      uniformsApi.getAll(),
      selectionsApi.getToday().catch(() => null),
    ]).then(([uRes, sRes]) => {
      const loaded = uRes.data
      setUniforms(loaded)

      if (sRes) {
        setTodaySelection(sRes.data)
      } else {
        // Restore mid-session state from localStorage
        const saved = loadSavedState()
        if (saved?.eliminationOrder?.length > 0) {
          const validIds = new Set(loaded.map((u) => u.id))
          const order = saved.eliminationOrder.filter((id) => validIds.has(id))
          setEliminationOrder(order)
          setEliminated(new Set(order))
        }
      }

      setLoading(false)
    })
  }, [])

  // ── Roulette spin ────────────────────────────────────────────────────────

  const spin = async () => {
    if (spinning) return

    const activeUniforms = uniforms.filter((u) => !eliminated.has(u.id))
    if (activeUniforms.length < 2) return

    setSpinning(true)
    spinningRef.current = true
    setWinner(null)
    setShowConfetti(false)

    let remaining = [...activeUniforms]
    const newOrder = [...eliminationOrder]

    while (remaining.length > 1 && spinningRef.current) {
      // Rapid highlight cycling — more cycles when fewer cards remain (drama)
      const cycles = Math.max(5, 16 - remaining.length * 2)
      for (let i = 0; i < cycles && spinningRef.current; i++) {
        const idx = Math.floor(Math.random() * remaining.length)
        setHighlighted(remaining[idx].id)
        await sleep(65)
      }

      if (!spinningRef.current) break

      // Pick & animate elimination
      const outIdx = Math.floor(Math.random() * remaining.length)
      const out = remaining[outIdx]
      remaining = remaining.filter((u) => u.id !== out.id)

      // Phase 1 — explosion animation (card still in DOM)
      setExploding((prev) => new Set([...prev, out.id]))
      setHighlighted(remaining[Math.floor(Math.random() * remaining.length)]?.id ?? null)

      await sleep(420) // match animate-pop-explode duration

      // Phase 2 — card exits DOM, grid reflows smoothly
      setExploding((prev) => {
        const s = new Set(prev)
        s.delete(out.id)
        return s
      })
      setEliminated((prev) => new Set([...prev, out.id]))
      newOrder.push(out.id)
      setEliminationOrder([...newOrder])

      // Persist mid-session
      saveState({ eliminationOrder: newOrder })

      // Pause grows as tension builds (fewer cards = longer wait)
      const pause = 120 + (uniforms.length - remaining.length) * 55
      await sleep(pause)
    }

    if (!spinningRef.current) return

    setHighlighted(null)
    setSpinning(false)
    spinningRef.current = false

    const win = remaining[0]
    setWinner(win)
    setShowConfetti(true)
    saveState({ winner: win?.id })

    try {
      const res = await selectionsApi.create({ uniform_id: win.id })
      setTodaySelection(res.data)
    } catch {
      // Already registered or server error — winner animation still shows
    }
  }

  // ── Undo ─────────────────────────────────────────────────────────────────

  const undo = () => {
    if (spinning || eliminationOrder.length === 0 || winner) return
    const lastId = eliminationOrder[eliminationOrder.length - 1]
    const newOrder = eliminationOrder.slice(0, -1)
    setEliminationOrder(newOrder)
    setEliminated((prev) => {
      const s = new Set(prev)
      s.delete(lastId)
      return s
    })
    saveState({ eliminationOrder: newOrder })
  }

  // ── Derived counts ────────────────────────────────────────────────────────

  const remaining = uniforms.filter(
    (u) => !eliminated.has(u.id) && !exploding.has(u.id)
  )
  const remainingCount = remaining.length

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-24 text-pink-300 text-lg font-semibold">
          Cargando colores...
        </div>
      </Layout>
    )
  }

  if (todaySelection && !winner && !spinning) {
    return (
      <Layout>
        <TodayCard selection={todaySelection} />
      </Layout>
    )
  }

  return (
    <Layout>
      {showConfetti && (
        <Confetti
          width={winSize.w}
          height={winSize.h}
          recycle={false}
          numberOfPieces={380}
          colors={['#f9a8d4', '#c084fc', '#86efac', '#fde68a', '#93c5fd', '#fca5a5', '#fdba74']}
        />
      )}

      {winner ? (
        <WinnerScreen winner={winner} />
      ) : (
        <>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-pink-400 mb-1">
              🎡 Ruleta de Uniformes
            </h1>
            <p className="text-gray-400 text-sm">¿Qué color te toca hoy?</p>
          </div>

          {uniforms.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <p className="text-4xl mb-2">🎨</p>
              <p>No hay colores activos. Agrega algunos en "Mis Colores".</p>
            </div>
          ) : (
            <>
              {/* Counter + Undo row */}
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-pink-400">
                    {remainingCount}
                  </span>
                  <span className="text-sm text-gray-400 font-semibold">
                    {remainingCount === 1 ? 'color restante' : 'colores restantes'}
                  </span>
                </div>

                {eliminationOrder.length > 0 && !spinning && (
                  <button
                    onClick={undo}
                    title="Deshacer última eliminación"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-xs font-bold shadow-sm hover:border-pink-300 hover:text-pink-400 transition-colors"
                  >
                    ↩ Deshacer
                    <span className="bg-pink-50 text-pink-400 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {eliminationOrder.length}
                    </span>
                  </button>
                )}
              </div>

              {/* Grid — eliminated cards are removed so grid reflows smoothly */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
                {uniforms
                  .filter((u) => !eliminated.has(u.id))
                  .map((u) => (
                    <UniformCard
                      key={u.id}
                      uniform={u}
                      isExploding={exploding.has(u.id)}
                      isHighlighted={highlighted === u.id && !exploding.has(u.id)}
                    />
                  ))}
              </div>

              {/* Restore hint if mid-session */}
              {eliminationOrder.length > 0 && !spinning && (
                <p className="text-center text-xs text-gray-300 -mt-6 mb-6 font-medium">
                  ✓ Progreso guardado — si recargas, seguirás desde aquí
                </p>
              )}

              {/* Spin button */}
              <div className="text-center">
                <button
                  onClick={spin}
                  disabled={spinning || remainingCount < 2}
                  className="px-12 py-4 bg-pink-400 hover:bg-pink-500 disabled:bg-pink-200 text-white text-xl font-extrabold rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
                >
                  {spinning ? '✨ Girando...' : '🎡 ¡Girar!'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </Layout>
  )
}
