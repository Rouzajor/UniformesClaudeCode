import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Mood = sequelize.define(
  'Mood',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    selection_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'selections',
        key: 'id',
      },
    },
    mood_emoji: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mood_label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'moods',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
)

export default Mood
