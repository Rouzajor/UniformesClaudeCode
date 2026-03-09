import { sequelize } from '../models/index.js'

beforeAll(async () => {
  await sequelize.sync({ force: true })
})

afterEach(async () => {
  // Recreate tables clean between tests (fast with SQLite :memory:)
  await sequelize.sync({ force: true })
})

afterAll(async () => {
  await sequelize.close()
})
