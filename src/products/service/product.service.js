import { ApiError } from "../../../utils/ApiError.js";
import ProductRepository from "../repository/product.repository.js";
import {ProductCategory,ProductImages} from "../index.js";
import { uploadToCloudinary } from "../../../config/multer.js";
import { CategoryModel } from "../../dbrelation.js";
const productRepository = new ProductRepository(); 

class ProductService {

    async createProduct(data,images) {
        try {
       
            const createdProduct = await productRepository.create(data);

            if (!createdProduct.id) {
                throw new ApiError(400, 'Product creation failed, no ID returned.');
            }
         
            if (data.categories && data.categories.length > 0) {
                const categoryAssociations = data.categories.map((categoryId) => ({
                    productId: createdProduct.id, 
                    categoryId,
                }));
              
                await ProductCategory.bulkCreate(categoryAssociations);
            }
            const uploadedImages = [];
            for (const image of images) {
                const uploadResult = await uploadToCloudinary(image, 'product_images');

            
                const newImage = await ProductImages.create({
                    productId: createdProduct.id,
                    cloudinaryId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                });

                uploadedImages.push(newImage);
            }
                createdProduct.images = uploadedImages;
            return { product: createdProduct,images:uploadedImages}
        } catch (error) {
            console.log("error dor service",error)
            throw new ApiError(400, 'Error creating product', error.errors);
        }
    }

    async getProductById(id) {
        try {
            const product = await productRepository.findById(id, {
                include: [
                    { model: ProductImages, as: 'images' }, 
                    { model: CategoryModel,  as: 'categories' } 
                ]
            });
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
            const products = await productRepository.findAll({
                include: [
                    { model: ProductImages, as: 'images' }, 
                    { model: CategoryModel,  as: 'categories' } 
                ]
            });
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
