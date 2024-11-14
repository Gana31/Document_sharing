import { DataTypes } from "sequelize";
import { sequelize } from "../../../config/databaseconfig.js";
import ProductModel from "./product.model.js";



const ProductImages = sequelize.define('ProductImages', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      productId: {
        type: DataTypes.UUID,
        references: {
            model: ProductModel,
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    cloudinaryId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
  } ,{
    tableName: 'product_images',
    timestamps: true,
  });
  
  
  export default ProductImages;