import CategoryModel from "./category/model/category.model.js";
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

export { CategoryModel,ProductCategory,ProductModel}
