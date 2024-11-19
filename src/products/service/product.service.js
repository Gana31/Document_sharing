import { ApiError } from "../../../utils/ApiError.js";
import ProductRepository from "../repository/product.repository.js";
import {ProductCategory,ProductImages} from "../index.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../../../config/multer.js";
import { CategoryModel } from "../../dbrelation.js";
import { Op } from 'sequelize';
const productRepository = new ProductRepository(); 

class ProductService {

    async createProduct(data, images) {
        const transaction = await productRepository.sequelize.transaction(); // Start transaction
        try {

            const createdProduct = await productRepository.create(data, { transaction });
    
            if (!createdProduct.id) {
                throw new ApiError(400, 'Product creation failed, no ID returned.',"service layer");
            }
    
            const categories = Array.isArray(data.categories) ? data.categories : [data.categories];
            
            if (categories.length > 0) {
                const categoryAssociations = categories.map((categoryId) => ({
                    productId: createdProduct.id,
                    categoryId,
                }));
        
                await ProductCategory.bulkCreate(categoryAssociations, { transaction });
            }

            const uploadedImages = [];
            for (const image of images) {
                const uploadResult = await uploadToCloudinary(image, 'product_images');
    
                const newImage = await ProductImages.create({
                    productId: createdProduct.id,
                    cloudinaryId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                }, { transaction });
    
                uploadedImages.push(newImage);
            }

            createdProduct.images = uploadedImages;
    
            await transaction.commit();
    
            return { product: createdProduct, images: uploadedImages };
        } catch (error) {
            await transaction.rollback();
    
            console.log("Error during product creation process:", error);
            throw new ApiError(400, error.errors[0]?.message ||  error.message || 'Error creating product','Service Layer',error.errors || error);
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

    async getAllProductsByUserId(userId) {
        try {
            const products = await productRepository.findAll({
                where: { createdBy: userId },  // Filter by createdBy
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' }
                ]
            });
            return products;
        } catch (error) {
            throw new ApiError(400, 'Error fetching products', error.errors);
        }
    }

    // Update a product
    async updateProduct(id, data, images) {
        const transaction = await productRepository.sequelize.transaction(); 
        try {
 
            const product = await productRepository.findById(id, {
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' }
                ],
                transaction
            });

            if (!product) {
                throw new ApiError(404, 'Product not found', 'Service Layer');
            }

      
            const oldCategories = product.categories.map(category => category.id);
            const newCategories = Array.isArray(data.categories) ? data.categories : [data.categories];


            const categoriesToRemove = oldCategories.filter(id => !newCategories.includes(id));
            if (categoriesToRemove.length > 0) {
                await ProductCategory.destroy({
                    where: {
                        productId: id,
                        categoryId: { [Op.in]: categoriesToRemove }
                    },
                    transaction
                });
            }

        
            const categoriesToAdd = newCategories.filter(id => !oldCategories.includes(id));
            if (categoriesToAdd.length > 0) {
                const categoryAssociations = categoriesToAdd.map(categoryId => ({
                    productId: id,
                    categoryId: categoryId
                }));
                await ProductCategory.bulkCreate(categoryAssociations, { transaction });
            }


            const oldImages = product.images.map(image => image.id);
            const newImages = images || [];

 
            const imagesToRemove = oldImages.filter(id => !newImages.some(image => image.id === id));
            for (const imageId of imagesToRemove) {
                const imageToRemove = product.images.find(image => image.id === imageId);
                if (imageToRemove) {
                    await deleteFromCloudinary(imageToRemove.cloudinaryId); 
                    await ProductImages.destroy({ where: { id: imageId }, transaction }); 
                }
            }


            const uploadedImages = [];
            for (const image of newImages) {
   
                if (!oldImages.includes(image.id)) {
                    const uploadResult = await uploadToCloudinary(image, 'product_images');
                    const newImage = await ProductImages.create({
                        productId: id,
                        cloudinaryId: uploadResult.public_id,
                        url: uploadResult.secure_url,
                    }, { transaction });
                    uploadedImages.push(newImage);
                }
            }

            await productRepository.update(id, data, { transaction });

          
            await transaction.commit();

   
            product.images = [...product.images, ...uploadedImages]; 
            return { product, images: product.images };
        } catch (error) {
            await transaction.rollback();
            console.log("Error during product update process:", error);
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error updating product', 'Service Layer', error.errors || error);
        }
    }

    // Delete a product
    async deleteProduct(id) {
        try {
            const product = await productRepository.findById(id, {
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' }
                ]
            });

            if (!product) {
                throw new ApiError(404, 'Product not found','Service Layer');
            }

            for (const image of product.images) {
                await deleteFromCloudinary(image.cloudinaryId);
                await ProductImages.destroy({ where: { id: image.id } }); 
            }

            await ProductCategory.destroy({ where: { productId: id } });

            const deleted = await productRepository.delete(id);

            return deleted;
        } catch (error) {
            console.log("Error in deleteProduct", error);
            throw new ApiError(400, error.errors[0]?.message ||  error.message || 'Error deleting product form service layer','Service Layer',error.errors || error);
        }
    }
}

export default new ProductService();
