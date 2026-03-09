import 'dotenv/config'
import { sequelize, Uniform } from '../models/index.js'

const uniforms = [
  { name: 'Blanco clásico',    hex_color: '#FFFFFF' },
  { name: 'Azul cielo',        hex_color: '#87CEEB' },
  { name: 'Azul marino',       hex_color: '#1B3A6B' },
  { name: 'Verde quirófano',   hex_color: '#4A9E6B' },
  { name: 'Rosa suave',        hex_color: '#F4A7B9' },
  { name: 'Lila',              hex_color: '#C3A6D8' },
  { name: 'Gris plata',        hex_color: '#B0B8C1' },
  { name: 'Turquesa',          hex_color: '#40C9C9' },
]

async function seed() {
  try {
    await sequelize.authenticate()
    await sequelize.sync()

    const existing = await Uniform.count()
    if (existing > 0) {
      console.log(`Seed omitido: ya existen ${existing} uniformes.`)
      return
    }

    await Uniform.bulkCreate(uniforms)
    console.log(`✓ ${uniforms.length} uniformes insertados correctamente.`)
  } catch (err) {
    console.error('Error en seed:', err)
  } finally {
    await sequelize.close()
  }
}

seed()
