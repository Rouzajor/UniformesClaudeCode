import request from 'supertest'
import { createApp } from './helpers/createApp.js'

import './setup.js'

const app = createApp()

/** Helper: create an active uniform and return its id */
async function makeUniform(name = 'Test Color', hex_color = '#AABBCC') {
  const res = await request(app).post('/api/uniforms').send({ name, hex_color })
  return res.body.id
}

describe('GET /api/selections/today', () => {
  it('returns 404 when no selection exists for today', async () => {
    const res = await request(app).get('/api/selections/today')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/selections', () => {
  it('creates a selection for today and returns 201', async () => {
    const uniformId = await makeUniform()
    const res = await request(app)
      .post('/api/selections')
      .send({ uniform_id: uniformId })

    expect(res.status).toBe(201)
    expect(res.body.uniform_id).toBe(uniformId)
    expect(res.body.selected_date).toBe(new Date().toISOString().split('T')[0])
    expect(res.body.day_of_week).toBeDefined()
  })

  it('returns 409 when a selection for today already exists', async () => {
    const uniformId = await makeUniform()
    await request(app).post('/api/selections').send({ uniform_id: uniformId })

    const again = await request(app)
      .post('/api/selections')
      .send({ uniform_id: uniformId })
    expect(again.status).toBe(409)
  })

  it('returns 404 when uniform_id does not exist', async () => {
    const res = await request(app)
      .post('/api/selections')
      .send({ uniform_id: 99999 })
    expect(res.status).toBe(404)
  })

  it('returns 422 when uniform_id is not a number', async () => {
    const res = await request(app)
      .post('/api/selections')
      .send({ uniform_id: 'abc' })
    expect(res.status).toBe(422)
  })
})

describe('GET /api/selections/today (after creation)', () => {
  it('returns the selection created today', async () => {
    const uniformId = await makeUniform('Lila', '#C3A6D8')
    await request(app).post('/api/selections').send({ uniform_id: uniformId })

    const res = await request(app).get('/api/selections/today')
    expect(res.status).toBe(200)
    expect(res.body.uniform_id).toBe(uniformId)
    expect(res.body.uniform).toBeDefined()
  })
})

describe('GET /api/selections (paginated history)', () => {
  it('returns paginated results with metadata', async () => {
    const uniformId = await makeUniform()
    await request(app).post('/api/selections').send({ uniform_id: uniformId })

    const res = await request(app).get('/api/selections?page=1&limit=10')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('page', 1)
    expect(res.body).toHaveProperty('totalPages')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns empty data array when no selections exist', async () => {
    const res = await request(app).get('/api/selections')
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.total).toBe(0)
  })
})
