import CategoryModel from "./category/model/category.model.js";
import OrderModel from "./order/model/order.model.js";
import ProductOrderMapping from "./order/model/productMapping.model.js";
import ProductImages from "./products/model/images.model.js";
import ProductCategory from "./products/model/product-category.model.js";
import ProductFeatures from "./products/model/product-feature.model.js";
import ProductModel from "./products/model/product.model.js";


ProductModel.belongsToMany(CategoryModel, {
  through: ProductCategory,   
  as: 'categories',               
  foreignKey: 'productId',       
  otherKey: 'categoryId',        
});

CategoryModel.belongsToMany(ProductModel, {
  through: ProductCategory,     
  as: 'products',                 
  foreignKey: 'categoryId',       
  otherKey: 'productId',          
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


OrderModel.hasMany(ProductOrderMapping, { foreignKey: 'orderId',as: 'orderMappings' });
ProductOrderMapping.belongsTo(OrderModel, { foreignKey: 'orderId' });


ProductModel.hasMany(ProductOrderMapping, { foreignKey: 'productId' });
ProductOrderMapping.belongsTo(ProductModel, { foreignKey: 'productId', as :'productordermapping' });


ProductModel.hasMany(ProductImages, { foreignKey: 'productId', as: 'images' });
ProductImages.belongsTo(ProductModel, { foreignKey: 'productId' });


ProductModel.hasMany(ProductFeatures, {
  foreignKey: 'productId',
  as: 'features',
});

ProductFeatures.belongsTo(ProductModel, {
  foreignKey: 'productId',
});


export { 
  CategoryModel, 
  ProductCategory, 
  ProductModel, 
  ProductOrderMapping, 
  OrderModel, 
  ProductImages,
  ProductFeatures
};
