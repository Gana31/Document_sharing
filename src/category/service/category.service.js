import { ApiError } from '../../../utils/ApiError.js';
import CategoryRepository from '../repository/category.repository.js';



const categoryRepository = new CategoryRepository();

    class CategoryService {
        async createCategory(data) {
            try {
                const { name, description } = data;
                const category = await categoryRepository.create({ name, description });
                return category;
            } catch (error) {
                throw new ApiError(400, error.message || 'Error creating category');
            }
        }
    
        async getAllCategories() {
            try {
                const categories = await categoryRepository.findAll();
                return categories;
            } catch (error) {
                throw new ApiError(400, error.message || 'Error retrieving categories');
            }
        }
    
        async getCategoryById(id) {
            try {
                const category = await categoryRepository.findById(id);
                if (!category) {
                    throw new ApiError(404, 'Category not found');
                }
                return category;
            } catch (error) {
                throw new ApiError(404, error.message || 'Error retrieving category');
            }
        }
    
        async updateCategory(id, data) {
            try {
                const updatedCategory = await categoryRepository.update(id, data);
                if (!updatedCategory) {
                    throw new ApiError(404, 'Category not found');
                }
                return updatedCategory;
            } catch (error) {
                throw new ApiError(400, error.message || 'Error updating category');
            }
        }
    
        async deleteCategory(id) {
            try {
                const response = await categoryRepository.delete(id);
                if (!response) {
                    throw new ApiError(404, 'Category not found');
                }
                return { message: 'Category deleted successfully' };
            } catch (error) {
                throw new ApiError(400, error.message || 'Error deleting category');
            }
        }

        async getProductsByCategoryName(categoryName) {
            try {
                const products = await categoryRepository.getProductsByCategoryName(categoryName);
                return products;
            } catch (error) {
                // console.log(error)
                throw new ApiError(400, error.message || 'Error fetching products by category name');
            }
        }
    
        async getProductsByCategoryId(categoryId) {
            try {
                const products = await categoryRepository.getProductsByCategoryId(categoryId);
                return products;
            } catch (error) {
                throw new ApiError(400, error.message || 'Error fetching products by category ID');
            }
        }
    }
    
export default new CategoryService();
