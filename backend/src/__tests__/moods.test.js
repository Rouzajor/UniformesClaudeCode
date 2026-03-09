import request from 'supertest'
import { createApp } from './helpers/createApp.js'

import './setup.js'

const app = createApp()

async function makeSelection() {
  const uni = await request(app)
    .post('/api/uniforms')
    .send({ name: 'Blanco', hex_color: '#FFFFFF' })
  const sel = await request(app)
    .post('/api/selections')
    .send({ uniform_id: uni.body.id })
  return sel.body.id
}

describe('POST /api/moods', () => {
  it('creates a mood and returns 201', async () => {
    const selectionId = await makeSelection()

    const res = await request(app).post('/api/moods').send({
      selection_id: selectionId,
      mood_emoji: '😊',
      mood_label: 'Feliz',
      notes: 'Buen día',
    })

    expect(res.status).toBe(201)
    expect(res.body.mood_emoji).toBe('😊')
    expect(res.body.mood_label).toBe('Feliz')
    expect(res.body.notes).toBe('Buen día')
  })

  it('returns 409 when mood already exists for selection', async () => {
    const selectionId = await makeSelection()
    const payload = { selection_id: selectionId, mood_emoji: '😊', mood_label: 'Feliz' }

    await request(app).post('/api/moods').send(payload)
    const again = await request(app).post('/api/moods').send(payload)
    expect(again.status).toBe(409)
  })

  it('returns 422 when mood_emoji is missing', async () => {
    const selectionId = await makeSelection()
    const res = await request(app)
      .post('/api/moods')
      .send({ selection_id: selectionId, mood_label: 'Feliz' })
    expect(res.status).toBe(422)
  })

  it('returns 404 when selection_id does not exist', async () => {
    const res = await request(app).post('/api/moods').send({
      selection_id: 99999,
      mood_emoji: '😊',
      mood_label: 'Feliz',
    })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/moods/:id', () => {
  it('updates mood and returns updated data', async () => {
    const selectionId = await makeSelection()
    const created = await request(app).post('/api/moods').send({
      selection_id: selectionId,
      mood_emoji: '😊',
      mood_label: 'Feliz',
    })

    const res = await request(app).put(`/api/moods/${created.body.id}`).send({
      mood_emoji: '😴',
      mood_label: 'Cansada',
      notes: 'Turno largo',
    })

    expect(res.status).toBe(200)
    expect(res.body.mood_emoji).toBe('😴')
    expect(res.body.mood_label).toBe('Cansada')
    expect(res.body.notes).toBe('Turno largo')
  })

  it('returns 404 for non-existent mood', async () => {
    const res = await request(app)
      .put('/api/moods/99999')
      .send({ mood_emoji: '😊', mood_label: 'Feliz' })
    expect(res.status).toBe(404)
  })
})
