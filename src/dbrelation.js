import CategoryModel from "./category/model/category.model.js";
import OrderModel from "./order/model/order.model.js";
import ProductOrderMapping from "./order/model/productMapping.model.js";
import ProductImages from "./products/model/images.model.js";
import ProductCategory from "./products/model/product-category.model.js";
import ProductModel from "./products/model/product.model.js";

// Product and Category Many-to-Many Relationship
ProductModel.belongsToMany(CategoryModel, {
  through: ProductCategory,   
  as: 'categories',               // Alias for the relation from ProductModel to CategoryModel
  foreignKey: 'productId',       
  otherKey: 'categoryId',        
});

CategoryModel.belongsToMany(ProductModel, {
  through: ProductCategory,     // Join table name
  as: 'products',                 // Alias for the relation from CategoryModel to ProductModel
  foreignKey: 'categoryId',       // Foreign key in the join table
  otherKey: 'productId',          // Corresponding foreign key for product
});

// Product and Order Many-to-Many Relationship (using ProductOrderMapping as the junction table)
ProductModel.belongsToMany(OrderModel, {
  through: ProductOrderMapping,
  as: 'orders',  // Alias for the relation from ProductModel to OrderModel
  foreignKey: 'productId',
  otherKey: 'orderId',
});

OrderModel.belongsToMany(ProductModel, {
  through: ProductOrderMapping,
  as: 'products',  // Alias for the relation from OrderModel to ProductModel
  foreignKey: 'orderId',
  otherKey: 'productId',
});

// One-to-many relationship between Order and ProductOrderMapping
OrderModel.hasMany(ProductOrderMapping, { foreignKey: 'orderId',as: 'orderMappings' });
ProductOrderMapping.belongsTo(OrderModel, { foreignKey: 'orderId' });

// One-to-many relationship between Product and ProductOrderMapping
ProductModel.hasMany(ProductOrderMapping, { foreignKey: 'productId' });
ProductOrderMapping.belongsTo(ProductModel, { foreignKey: 'productId', as :'productordermapping' });

// One-to-many relationship between Product and ProductImages
ProductModel.hasMany(ProductImages, { foreignKey: 'productId', as: 'images' });
ProductImages.belongsTo(ProductModel, { foreignKey: 'productId' });

export { 
  CategoryModel, 
  ProductCategory, 
  ProductModel, 
  ProductOrderMapping, 
  OrderModel, 
  ProductImages
};
