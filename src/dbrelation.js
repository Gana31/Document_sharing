import CategoryModel from "./category/model/category.model.js";
import OrderModel from "./order/model/order.model.js";
import ProductOrderMapping from "./order/model/productMapping.model.js";
import ProductImages from "./products/model/images.model.js";
import ProductCategory from "./products/model/product-category.model.js";
import ProductModel from "./products/model/product.model.js";



ProductModel.belongsToMany(CategoryModel, {
  through: ProductCategory,   
  as: 'categories',              
  foreignKey: 'productId',       
  otherKey: 'categoryId',        
});
CategoryModel.belongsToMany(ProductModel, {
  through: ProductCategory,     // Join table name
  as: 'products',                 // Alias for association
  foreignKey: 'categoryId',       // Foreign key in join table
  otherKey: 'productId',          // Corresponding foreign key for product
});

ProductModel.belongsToMany(OrderModel, {
  through: ProductOrderMapping,
  as: 'orders',
  foreignKey: 'productId',
  otherKey: 'orderId',
});

OrderModel.belongsToMany(ProductModel, {
  through: ProductOrderMapping,
  as: 'products',
  foreignKey: 'orderId',
  otherKey: 'productId',
});

// One-to-many relationship between Order and ProductOrderMapping
OrderModel.hasMany(ProductOrderMapping, { foreignKey: 'orderId' });
ProductOrderMapping.belongsTo(OrderModel, { foreignKey: 'orderId' });

// One-to-many relationship between Product and ProductOrderMapping
ProductModel.hasMany(ProductOrderMapping, { foreignKey: 'productId' });
ProductOrderMapping.belongsTo(ProductModel, { foreignKey: 'productId' });

ProductModel.hasMany(ProductImages, { foreignKey: 'productId', as: 'images' });
ProductImages.belongsTo(ProductModel, { foreignKey: 'productId'});;



export { CategoryModel,ProductCategory,ProductModel,ProductOrderMapping,OrderModel,ProductImages}
