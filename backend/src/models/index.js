import sequelize from '../config/database.js'
import Uniform from './Uniform.js'
import Selection from './Selection.js'
import Mood from './Mood.js'

// Uniform → Selection (one to many)
Uniform.hasMany(Selection, { foreignKey: 'uniform_id', as: 'selections' })
Selection.belongsTo(Uniform, { foreignKey: 'uniform_id', as: 'uniform' })

// Selection → Mood (one to one)
Selection.hasOne(Mood, { foreignKey: 'selection_id', as: 'mood' })
Mood.belongsTo(Selection, { foreignKey: 'selection_id', as: 'selection' })

export { sequelize, Uniform, Selection, Mood }
