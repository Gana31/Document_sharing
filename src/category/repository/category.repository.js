import { ApiError } from "../../../utils/ApiError.js";
import CrudRepository from "../../../utils/crudClass.js"
import { CategoryModel, ProductModel } from "../../dbrelation.js";



class CategoryRepository extends CrudRepository{
   constructor(){
        super(CategoryModel)
   }

   async getProductsByCategoryName(categoryName) {
      try {
          const category = await this.model.findOne({
              where: { name: categoryName },
              include: {
                  model: ProductModel,
                  as: 'products', // This alias should match the one used in CategoryModel.belongsToMany
              },
          });

          if (!category) {

              throw new ApiError(404, `Category with name ${categoryName} not found`, "from the Repository layer");
          }

          return category.products || []; 
      } catch (error) {
         console.log(error)
         throw new ApiError(400, error.errors[0]?.message || error?.message || 'Error fetching products by category name', "from the Repository layer",error.errors || error );
      }
  }

  // Method to get products by category ID
  async getProductsByCategoryId(categoryId) {
      try {
          const category = await this.model.findOne({
              where: { id: categoryId },
              include: {
                  model: ProductModel,
                  as: 'products', 
              },
          });

          if (!category) {
              throw new ApiError(404, `Category with ID ${categoryId} not found`, "from the Repository layer");
          }

          return category.products || []; 
      } catch (error) {
        console.log(error)
        throw new ApiError(400, error.errors[0]?.message || error?.message || 'Error fetching products by category ID', "from the Repository layer",error.errors || error );
      }
  }
}
export default CategoryRepository