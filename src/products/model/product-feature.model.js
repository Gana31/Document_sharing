import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/databaseconfig.js';


const ProductFeatures = sequelize.define('ProductFeature', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  feature: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'product_features',
  timestamps: true,
});

export default ProductFeatures;
