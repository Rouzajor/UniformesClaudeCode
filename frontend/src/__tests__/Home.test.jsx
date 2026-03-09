import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-confetti', () => ({ default: () => null }))

vi.mock('../api', () => ({
  uniformsApi: { getAll: vi.fn() },
  selectionsApi: { getToday: vi.fn(), create: vi.fn() },
}))

import { uniformsApi, selectionsApi } from '../api'
import Home from '../pages/Home'

// ── Fixtures ─────────────────────────────────────────────────────────────────

const UNIFORMS = [
  { id: 1, name: 'Azul cielo',      hex_color: '#87CEEB', is_active: true },
  { id: 2, name: 'Rosa suave',      hex_color: '#F4A7B9', is_active: true },
  { id: 3, name: 'Verde quirófano', hex_color: '#4A9E6B', is_active: true },
]

const TODAY_SELECTION = {
  id: 10,
  uniform_id: 1,
  selected_date: new Date().toISOString().split('T')[0],
  day_of_week: 'Lunes',
  uniform: UNIFORMS[0],
  mood: null,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Home — loading state', () => {
  beforeEach(() => {
    // Never resolves during this test
    uniformsApi.getAll.mockReturnValue(new Promise(() => {}))
    selectionsApi.getToday.mockRejectedValue(new Error('404'))
  })

  it('shows loading text while fetching', () => {
    renderHome()
    expect(screen.getByText(/Cargando colores/i)).toBeInTheDocument()
  })
})

describe('Home — today already selected', () => {
  beforeEach(() => {
    uniformsApi.getAll.mockResolvedValue({ data: UNIFORMS })
    selectionsApi.getToday.mockResolvedValue({ data: TODAY_SELECTION })
  })

  it('shows TodayCard with uniform name and "Hoy elegiste"', async () => {
    renderHome()
    await waitFor(() => expect(screen.getByText(/Hoy elegiste/i)).toBeInTheDocument())
    expect(screen.getByText('Azul cielo')).toBeInTheDocument()
    expect(screen.queryByText(/¡Girar!/i)).not.toBeInTheDocument()
  })

  it('shows mood emoji when present', async () => {
    selectionsApi.getToday.mockResolvedValue({
      data: { ...TODAY_SELECTION, mood: { mood_emoji: '😊', mood_label: 'Feliz' } },
    })
    renderHome()
    await waitFor(() => expect(screen.getByText('😊')).toBeInTheDocument())
  })
})

describe('Home — roulette ready', () => {
  beforeEach(() => {
    uniformsApi.getAll.mockResolvedValue({ data: UNIFORMS })
    selectionsApi.getToday.mockRejectedValue(new Error('404'))
    localStorage.clear()
  })

  it('renders all uniform cards', async () => {
    renderHome()
    await waitFor(() => expect(screen.getByText('Azul cielo')).toBeInTheDocument())
    expect(screen.getByText('Rosa suave')).toBeInTheDocument()
    expect(screen.getByText('Verde quirófano')).toBeInTheDocument()
  })

  it('shows the correct remaining counter', async () => {
    renderHome()
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    expect(screen.getByText(/colores restantes/i)).toBeInTheDocument()
  })

  it('renders the "¡Girar!" button enabled', async () => {
    renderHome()
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /Girar/i })
      expect(btn).toBeInTheDocument()
      expect(btn).not.toBeDisabled()
    })
  })

  it('does NOT show the undo button when nothing is eliminated', async () => {
    renderHome()
    await waitFor(() => screen.getByText('Azul cielo'))
    expect(screen.queryByText(/Deshacer/i)).not.toBeInTheDocument()
  })
})

describe('Home — empty uniforms', () => {
  beforeEach(() => {
    uniformsApi.getAll.mockResolvedValue({ data: [] })
    selectionsApi.getToday.mockRejectedValue(new Error('404'))
  })

  it('shows empty state message', async () => {
    renderHome()
    await waitFor(() =>
      expect(screen.getByText(/No hay colores activos/i)).toBeInTheDocument()
    )
    expect(screen.queryByRole('button', { name: /Girar/i })).not.toBeInTheDocument()
  })
})

describe('Home — localStorage restore', () => {
  beforeEach(() => {
    localStorage.clear()
    uniformsApi.getAll.mockResolvedValue({ data: UNIFORMS })
    selectionsApi.getToday.mockRejectedValue(new Error('404'))
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('restores eliminated cards from localStorage and shows undo button', async () => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(
      'uniformes_roulette',
      JSON.stringify({ date: today, eliminationOrder: [1] })
    )

    renderHome()

    await waitFor(() => {
      // Card 1 (Azul cielo) should be gone from the grid
      expect(screen.queryByText('Azul cielo')).not.toBeInTheDocument()
    })

    // Undo button should be visible
    expect(screen.getByText(/Deshacer/i)).toBeInTheDocument()

    // Counter should reflect 2 remaining
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('ignores localStorage state from a different day', async () => {
    localStorage.setItem(
      'uniformes_roulette',
      JSON.stringify({ date: '1999-01-01', eliminationOrder: [1, 2] })
    )

    renderHome()
    await waitFor(() => expect(screen.getByText('Azul cielo')).toBeInTheDocument())

    // All 3 should be visible, old state discarded
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

describe('Home — undo button', () => {
  beforeEach(() => {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(
      'uniformes_roulette',
      JSON.stringify({ date: today, eliminationOrder: [2] })
    )
    uniformsApi.getAll.mockResolvedValue({ data: UNIFORMS })
    selectionsApi.getToday.mockRejectedValue(new Error('404'))
  })

  afterEach(() => localStorage.clear())

  it('clicking undo restores the card and updates the counter', async () => {
    renderHome()

    // Wait until loaded with 2 remaining (card id=2 eliminated)
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
    expect(screen.queryByText('Rosa suave')).not.toBeInTheDocument()

    // Click undo
    fireEvent.click(screen.getByText(/Deshacer/i))

    // Counter goes back to 3 and card reappears
    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    expect(screen.getByText('Rosa suave')).toBeInTheDocument()
  })

  it('undo button disappears after restoring the last eliminated card', async () => {
    renderHome()
    await waitFor(() => expect(screen.getByText(/Deshacer/i)).toBeInTheDocument())

    fireEvent.click(screen.getByText(/Deshacer/i))

    await waitFor(() =>
      expect(screen.queryByText(/Deshacer/i)).not.toBeInTheDocument()
    )
  })
})
