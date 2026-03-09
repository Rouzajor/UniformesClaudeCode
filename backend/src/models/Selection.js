import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const Selection = sequelize.define(
  'Selection',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    uniform_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'uniforms',
        key: 'id',
      },
    },
    selected_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
    },
    day_of_week: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'selections',
    underscored: true,
    timestamps: true,
    updatedAt: false,
    hooks: {
      beforeValidate(selection) {
        if (selection.selected_date) {
          const date = new Date(selection.selected_date + 'T00:00:00')
          selection.day_of_week = DAYS[date.getDay()]
        }
      },
    },
  }
)

export default Selection
