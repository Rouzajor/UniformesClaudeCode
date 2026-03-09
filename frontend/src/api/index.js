import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const uniformsApi = {
  getAll: () => api.get('/uniforms'),
  create: (data) => api.post('/uniforms', data),
  update: (id, data) => api.put(`/uniforms/${id}`, data),
  deactivate: (id) => api.delete(`/uniforms/${id}`),
}

export const selectionsApi = {
  getHistory: (params) => api.get('/selections', { params }),
  getToday: () => api.get('/selections/today'),
  create: (data) => api.post('/selections', data),
}

export const moodsApi = {
  create: (data) => api.post('/moods', data),
  update: (id, data) => api.put(`/moods/${id}`, data),
}

export const statsApi = {
  byColor: () => api.get('/stats/by-color'),
  byWeekday: () => api.get('/stats/by-weekday'),
  moodColor: () => api.get('/stats/mood-color'),
}
