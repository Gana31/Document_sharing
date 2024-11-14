// models/ProductOrderMapping.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/databaseconfig.js';
import ProductModel  from '../../products/model/product.model.js';
import OrderModel from './order.model.js';


const ProductOrderMapping = sequelize.define('ProductOrderMapping', {
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
        model: ProductModel,
        key: 'id'
      }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
        model: OrderModel,
        key: 'id'
      }
  }
}, {
  tableName: 'product_order_mappings',
  timestamps: true,
});



export default ProductOrderMapping;
