import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/databaseconfig.js";
import ProductModel from "./product.model.js";
import CategoryModel from "../../category/model/category.model.js";


const ProductCategory = sequelize.define('ProductCategory', {
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
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: CategoryModel,
        key: 'id'
      }
    }
  } ,{
    tableName: 'product_categories',  // Ensure table name matches your actual table
    timestamps: true,
  });
  
  
  export default ProductCategory;