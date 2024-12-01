import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/databaseconfig.js';
import UserModel from '../../users/model/user.model.js';


const OrderModel = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: UserModel,
      key: 'id'
    }
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  razorpayorderid: {
    type: DataTypes.STRING,  // Razorpay order ID is typically a string
    unique: true,  // Ensure that the Razorpay order ID is unique
  },
  paymentstatus:{
    type: DataTypes.STRING,
    defaultValue:"UnPaid"
  }
}, {
  tableName: 'orders',
  timestamps: true,
});

export default OrderModel;
