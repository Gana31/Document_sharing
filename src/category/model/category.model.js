import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/databaseconfig.js';

const CategoryModel = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'categories',
  timestamps: true,
});

export default CategoryModel;
