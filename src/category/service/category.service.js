import { ApiError } from '../../../utils/ApiError.js';
import CategoryRepository from '../repository/category.repository.js';



const categoryRepository = new CategoryRepository();

    class CategoryService {
        async createCategory(data) {
            try {
                const { name, description,userId } = data;
                const category = await categoryRepository.create({ name, description ,createdby:userId});
                return category;
            } catch (error) {
                // console.log(error)
                throw new ApiError(400, error.errors[0]?.message || error.message || 'Error creating category', 'Service Layer', error.errors || error);
            }
        }
    
        async getAllCategories() {
            try {
                const categories = await categoryRepository.findAll();
                return categories;
            } catch (error) {
                throw new ApiError(400, error.errors[0]?.message || error.message ||  'Error retrieving categories', 'Service Layer', error.errors || error)
            }
        }
    
        async getCategoryById(id) {
            try {
                const category = await categoryRepository.findById(id);
                if (!category) {
                    throw new ApiError(404, 'Category not found', 'Service Layer');
                }
                return category;
            } catch (error) {
                throw new ApiError(400, error.errors[0]?.message || error.message ||  'Error retrieving category', 'Service Layer', error.errors || error)
            }
        }
        
        async getCategoriesByUserId(userId) {
            try {
                const categories = await categoryRepository.findAll({
                    where: { createdby: userId }, 
                });
                return categories;
            } catch (error) {
                throw new ApiError(400, error.errors[0]?.message || error.message ||'Error fetching categories by user ID', 'Service Layer', error.errors || error)
            }
        }

        async updateCategory(id, data) {
            try {

                const category = await categoryRepository.findById(id);
        
                if (!category) {
                    throw new ApiError(404, 'Category not found', 'Service Layer');
                }
        
                if (category.createdby !== data.userId) {
                    throw new ApiError(403, 'You are not authorized to update this category', 'Service Layer');
                }
        
                const updatedCategory = await categoryRepository.update(id, data);
                return updatedCategory;
            } catch (error) {
                // console.log(error)
                throw new ApiError(400, error.errors[0]?.message || error.message || 'Error updating category', 'Service Layer', error.errors || error)
            }
        }
    
        async deleteCategory(id,userId) {
            try {
                const category = await categoryRepository.findById(id);
        
                if (!category) {
                    throw new ApiError(404, 'Category not found', 'Service Layer');
                }
        
                if (category.createdby !== userId) {
                    throw new ApiError(403, 'You are not authorized to update this category', 'Service Layer');
                }
        
                const response = await categoryRepository.delete(id);
                if (!response) {
                    throw new ApiError(404, 'Category not found', 'Service Layer');
                }
                return { message: 'Category deleted successfully' };
            } catch (error) {
                throw new ApiError(400, error.errors[0]?.message || error.message ||  'Error deleting category', 'Service Layer', error.errors || error)
            }
        }

        async getProductsByCategoryName(categoryName) {
            try {
                const products = await categoryRepository.getProductsByCategoryName(categoryName);
                return products;
            } catch (error) {
                // console.log(error)
                throw new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching products by category name', 'Service Layer', error.errors || error)
            }
        }
    
        async getProductsByCategoryId(categoryId) {
            try {
                const products = await categoryRepository.getProductsByCategoryId(categoryId);
                return products;
            } catch (error) {
                throw new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching products by category ID', 'Service Layer', error.errors || error)
            }
        }
    }
    
export default new CategoryService();
