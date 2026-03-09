import request from 'supertest'
import { createApp } from './helpers/createApp.js'

// Shared DB lifecycle
import './setup.js'

const app = createApp()

const VALID = { name: 'Azul cielo', hex_color: '#87CEEB' }
const INVALID_HEX = { name: 'Roto', hex_color: 'not-a-color' }
const MISSING_NAME = { hex_color: '#FFFFFF' }

describe('GET /api/uniforms', () => {
  it('returns an empty array when no uniforms exist', async () => {
    const res = await request(app).get('/api/uniforms')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns only active uniforms', async () => {
    // Create two, deactivate one
    const a = await request(app).post('/api/uniforms').send(VALID)
    const b = await request(app)
      .post('/api/uniforms')
      .send({ name: 'Verde', hex_color: '#4A9E6B' })

    await request(app).delete(`/api/uniforms/${b.body.id}`)

    const res = await request(app).get('/api/uniforms')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].id).toBe(a.body.id)
  })
})

describe('POST /api/uniforms', () => {
  it('creates a uniform and returns 201', async () => {
    const res = await request(app).post('/api/uniforms').send(VALID)
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Azul cielo', hex_color: '#87CEEB', is_active: true })
    expect(res.body.id).toBeDefined()
  })

  it('returns 422 for an invalid hex_color', async () => {
    const res = await request(app).post('/api/uniforms').send(INVALID_HEX)
    expect(res.status).toBe(422)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 422 when name is missing', async () => {
    const res = await request(app).post('/api/uniforms').send(MISSING_NAME)
    expect(res.status).toBe(422)
  })
})

describe('PUT /api/uniforms/:id', () => {
  it('updates name and hex_color', async () => {
    const created = await request(app).post('/api/uniforms').send(VALID)
    const id = created.body.id

    const res = await request(app)
      .put(`/api/uniforms/${id}`)
      .send({ name: 'Rosa suave', hex_color: '#F4A7B9' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Rosa suave')
    expect(res.body.hex_color).toBe('#F4A7B9')
  })

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .put('/api/uniforms/99999')
      .send({ name: 'X', hex_color: '#FFFFFF' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/uniforms/:id (soft delete)', () => {
  it('deactivates the uniform (is_active becomes false)', async () => {
    const created = await request(app).post('/api/uniforms').send(VALID)
    const id = created.body.id

    const del = await request(app).delete(`/api/uniforms/${id}`)
    expect(del.status).toBe(200)
    expect(del.body.message).toMatch(/deactivated/i)

    // Should no longer appear in active list
    const list = await request(app).get('/api/uniforms')
    expect(list.body.find((u) => u.id === id)).toBeUndefined()
  })

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/api/uniforms/99999')
    expect(res.status).toBe(404)
  })
})
