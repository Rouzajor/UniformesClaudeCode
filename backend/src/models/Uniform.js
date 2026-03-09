import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Uniform = sequelize.define(
  'Uniform',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hex_color: {
      type: DataTypes.STRING(7),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'uniforms',
    underscored: true,
  }
)

export default Uniform
