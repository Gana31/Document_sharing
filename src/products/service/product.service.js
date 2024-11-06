import { ApiError } from "../../../utils/ApiError.js";

import ProductRepository from "../repository/product.repository.js";
import {ProductCategory} from "../index.js";
const productRepository = new ProductRepository(); 

class ProductService {
    // Create a new product
    async createProduct(data) {
        try {
            // Step 1: Create the product
            const createdProduct = await productRepository.create(data);
            console.log('Created Product:', createdProduct);

            if (!createdProduct.id) {
                throw new ApiError(400, 'Product creation failed, no ID returned.');
            }
            // Step 2: Associate categories with the created product
            if (data.categories && data.categories.length > 0) {
                const categoryAssociations = data.categories.map((categoryId) => ({
                    productId: createdProduct.id, // Ensure the productId is assigned
                    categoryId,
                }));
                console.log('Category Associations:', categoryAssociations);
                // Insert into ProductCategories table
                await ProductCategory.bulkCreate(categoryAssociations);
            }

            return createdProduct;
        } catch (error) {
            console.log(error)
            throw new ApiError(400, 'Error creating product', error.errors);
        }
    }

    // Get product by ID
    async getProductById(id) {
        try {
            const product = await productRepository.findById(id);
            if (!product) {
                throw new ApiError(404, 'Product not found');
            }
            return product;
        } catch (error) {
            throw new ApiError(400, 'Error fetching product', error.errors);
        }
    }

    // Get all products
    async getAllProducts() {
        try {
            const products = await productRepository.findAll();
            return products;
        } catch (error) {
            throw new ApiError(400, 'Error fetching products', error.errors);
        }
    }

    // Update a product
    async updateProduct(id, data) {
        try {
            const updatedProduct = await productRepository.update(id, data);
            return updatedProduct;
        } catch (error) {
            throw new ApiError(400, 'Error updating product', error.errors);
        }
    }

    // Delete a product
    async deleteProduct(id) {
        try {
            const response = await productRepository.delete(id);
            return response;
        } catch (error) {
            throw new ApiError(400, 'Error deleting product', error.errors);
        }
    }
}

export default new ProductService();
