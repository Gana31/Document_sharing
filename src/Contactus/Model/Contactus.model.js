import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/databaseconfig.js';


const ContactModel = sequelize.define('contacts', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures email uniqueness
    validate: {
      isEmail: true, // Validates email format
    },
  },
  phoneNo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 12], // Validates phone number length
    },
  },
  countrycode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'contacts',
  timestamps: true, // Adds createdAt and updatedAt fields
});

export default ContactModel;
