import { ApiError } from "../../../utils/ApiError.js";
import ProductRepository from "../repository/product.repository.js";
import { ProductCategory, ProductImages } from "../index.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../../../config/multer.js";
import { CategoryModel, ProductFeatures } from "../../dbrelation.js";
import { Op } from 'sequelize';
const productRepository = new ProductRepository();

class ProductService {

    async createProduct(data, images, pdfFile = null) {
        console.log(data)
        const transaction = await productRepository.sequelize.transaction(); // Start transaction
        try {
            // Handle access_mode and adjust the stock
            if (data.access_mode === 'online') {
                data.stock = 0; // Set stock to 0 for online products
            }

            const createdProduct = await productRepository.create(data, { transaction });

            if (!createdProduct.id) {
                throw new ApiError(400, 'Product creation failed, no ID returned.', "service layer");
            }

            // Handle product features
            const features = data.features || [];
            const featureRecords = features.map((feature) => ({
                productId: createdProduct.id,
                feature,
            }));
            await ProductFeatures.bulkCreate(featureRecords, { transaction });

            // Handle product categories
            const categories = Array.isArray(data.categories) ? data.categories : [data.categories];
            if (categories.length > 0) {
                const categoryAssociations = categories.map((categoryId) => ({
                    productId: createdProduct.id,
                    categoryId,
                }));
                await ProductCategory.bulkCreate(categoryAssociations, { transaction });
            }

            // Handle product images
            const uploadedFiles = [];
            const pdf = []
            for (const image of images) {
                const uploadResult = await uploadToCloudinary(image, 'product_images');
                const newImage = await ProductImages.create({
                    productId: createdProduct.id,
                    cloudinaryId: uploadResult.public_id,
                    url: uploadResult.secure_url,
                    modeltype: 'image', // For product images
                }, { transaction });
                uploadedFiles.push(newImage);
            }

            // If online, handle PDF/Word file upload
            if (data.access_mode === 'online' && pdfFile) {
                const pdfUploadResult = await uploadToCloudinary(pdfFile, 'product_pdf');
                const newImage2 = await ProductImages.create({
                    productId: createdProduct.id,
                    cloudinaryId: pdfUploadResult.public_id,
                    url: pdfUploadResult.secure_url,
                    modeltype: 'pdf'// Set modeltype based on the file type
                }, { transaction });
                console.log(newImage2)
                pdf.push(newImage2);
            }

            createdProduct.images = uploadedFiles;

            await transaction.commit();

            return { product: createdProduct, images: uploadedFiles, pdf: pdf };
        } catch (error) {
            await transaction.rollback();
            throw new ApiError(
                400,
                error.errors[0]?.message || error.message || 'Error creating product',
                'Service Layer',
                error.errors || error
            );
        }
    }



    async getProductById(id) {
        try {
            const product = await productRepository.findById(id, {
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },
                ]
            });
            if (!product) {
                throw new ApiError(404, 'Product not found', 'Service Layer');
            }
            return product;
        } catch (error) {
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching product', 'Service Layer', error.errors || error);
        }
    }

    // Get all products
    async getAllProducts() {
        try {
            const products = await productRepository.findAll({
                include: [
                    {
                        model: ProductImages,
                        as: 'images',
                        required: false  // No filter yet, just include all images
                    },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },
                ]
            });

            // Filter images manually to exclude those with modeltype 'pdf'
            const plainProducts = JSON.parse(JSON.stringify(products)); // Deep copy the products array

            plainProducts.forEach(product => {
                if (product.images && Array.isArray(product.images)) {
                    // Mutate the images array as needed
                    product.images = product.images.filter(image => image.modeltype !== 'pdf');
                }
            });

            return plainProducts;
        } catch (error) {
            console.error('Error:', error);  // Log the error for further debugging
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching products', 'Service Layer', error.errors || error);
        }
    }

    async getAllProductsList() {
        try {
            const products = await productRepository.findAll({
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },
                ]
            });
            return products;
        } catch (error) {
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching products', 'Service Layer', error.errors || error);
        }
    }
    async searchProductsByName(title, limit = 10, page = 1) {
        try {
            console.log("Searching for:", title);  // This will log the correct search term like 'book'
            const offset = (page - 1) * limit;

            const products = await productRepository.findAll({
                where: {
                    title: {
                        [Op.iLike]: `%${title}%`,  // Case-insensitive search
                    }
                },
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },
                ],
                limit: limit,
                offset: offset,
                order: [['title', 'ASC']],
            });

            return products;
        } catch (error) {
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error searching products by name', 'Service Layer', error.errors || error);
        }
    }


    async getAllProductsByUserId(userId) {
        try {
            // Fetch products with associated data
            const products = await productRepository.findAll({
                where: { createdBy: userId }, // Filter by createdBy
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },
                ]
            });

            // Process each product to split images into separate arrays
            const processedProducts = products.map(product => {
                if (product.access_mode === 'online') {
                    const images = product.images || [];

                    // Separate images into "pdfs" and "photos"
                    const pdfs = images.filter(image => image.modeltype === 'pdf');
                    const photos = images.filter(image => image.modeltype !== 'pdf');
                    // console.log(pdfs,photos)
                    return {
                        ...product.toJSON(),
                        pdfs,        // Array of pdf images
                        images: photos, // Remaining images after removing pdfs
                    };
                }

                return product.toJSON(); // Return product as is if access_mode is not 'online'
            });

            return processedProducts;
        } catch (error) {
            throw new ApiError(
                400,
                error.errors?.[0]?.message || error.message || 'Error fetching products',
                'Service Layer',
                error.errors || error
            );
        }
    }

    async updateProduct(id, data, files) {
        // console.log(id, data, files, "from the service");
        const transaction = await productRepository.sequelize.transaction();
        try {
            // Find the product along with its associations
            const product = await productRepository.findById(id, {
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },
                ],
                transaction
            });

            if (!product) {
                throw new ApiError(404, 'Product not found', 'Service Layer');
            }

            // Handling category associations
            const oldCategoryIds = product.categories.map(category => category.id);
            const newCategoryIds = Array.isArray(data.categories) ? data.categories : [data.categories];

            const categoriesToRemove = oldCategoryIds.filter(id => !newCategoryIds.includes(id));
            if (categoriesToRemove.length > 0) {
                await ProductCategory.destroy({
                    where: {
                        productId: id,
                        categoryId: { [Op.in]: categoriesToRemove }
                    },
                    transaction
                });
            }

            const categoriesToAdd = newCategoryIds.filter(id => !oldCategoryIds.includes(id));
            if (categoriesToAdd.length > 0) {
                const newAssociations = categoriesToAdd.map(categoryId => ({
                    productId: id,
                    categoryId
                }));
                await ProductCategory.bulkCreate(newAssociations, { transaction });
            }

            // Handling feature updates
            if (product.features.length > 0) {
                const oldFeatures = product.features.map(feature => feature.feature);
                const newFeatures = Array.isArray(data.features) ? data.features : [data.features];

                const featuresToRemove = product.features.filter(feature => !newFeatures.includes(feature.feature));
                if (featuresToRemove.length > 0) {
                    const featureIdsToRemove = featuresToRemove.map(feature => feature.id);
                    await ProductFeatures.destroy({
                        where: { id: { [Op.in]: featureIdsToRemove } },
                        transaction
                    });
                }

                const featuresToAdd = newFeatures.filter(feature => !oldFeatures.includes(feature));
                if (featuresToAdd.length > 0) {
                    const newFeatureRecords = featuresToAdd.map(feature => ({
                        productId: id,
                        feature
                    }));
                    await ProductFeatures.bulkCreate(newFeatureRecords, { transaction });
                }
            }

            // Handle the images and documents update
            const oldImageIds = Array.isArray(data.oldImages) ? data.oldImages.map(image => JSON.parse(image).id) : [];
            const images = files?.images || [];
            const document = files?.document?.[0]; // Only one document allowed

            // Separate product images and documents from the database
            const dbImages = product.images.filter(img => img.modeltype === 'image');
            const dbDocument = product.images.find(img => img.modeltype === 'pdf');
            console.log(document)
            // Handle image deletion if necessary
            const imagesToDelete = dbImages.filter(img => !oldImageIds.includes(img.id));

            // Delete images from Cloudinary and DB
            for (const image of imagesToDelete) {
                await deleteFromCloudinary(image.cloudinaryId);
                await ProductImages.destroy({ where: { id: image.id }, transaction });
            }

            // Update the images
            let retainedImages = dbImages.filter(img => oldImageIds.includes(img.id));
            let uploadedImages = [];

            for (const image of images) {
                const uploadResult = await uploadToCloudinary(image, 'product_images');
                const newImage = await ProductImages.create(
                    {
                        productId: id,
                        cloudinaryId: uploadResult.public_id,
                        url: uploadResult.secure_url,
                        modeltype: 'image',
                    },
                    { transaction }
                );
                uploadedImages.push(newImage);
            }

            // Handle the document update or addition
            if (document) {
                if (dbDocument) {
                    // If a document already exists, delete it from Cloudinary
                    await deleteFromCloudinary(dbDocument.cloudinaryId);
                    await ProductImages.destroy({ where: { id: dbDocument.id }, transaction });
                }

                // Upload the new document
                const uploadResult = await uploadToCloudinary(document, 'product_pdf');
                await ProductImages.create(
                    {
                        productId: id,
                        cloudinaryId: uploadResult.public_id,
                        url: uploadResult.secure_url,
                        modeltype: 'pdf',
                    },
                    { transaction }
                );
            }

            // Update the product data excluding images and categories
            const updatedData = { ...data };
            delete updatedData.images;
            delete updatedData.categories;

            await productRepository.update(id, updatedData, { transaction });

            await transaction.commit();

            // Combine the retained and uploaded images for the response
            const updatedProduct = product.toJSON();
            updatedProduct.images = [...retainedImages, ...uploadedImages];

            return { product: updatedProduct };

        } catch (error) {
            await transaction.rollback();
            console.log(error)
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error updating product from service layer', 'Service Layer', error.errors || error);
        }
    }


    // Delete a product
    async deleteProduct(id) {
        try {
            const product = await productRepository.findById(id, {
                include: [
                    { model: ProductImages, as: 'images' },
                    { model: CategoryModel, as: 'categories' },
                    { model: ProductFeatures, as: 'features' },

                ]
            });

            if (!product) {
                throw new ApiError(404, 'Product not found', 'Service Layer');
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
            throw new ApiError(400, error.errors[0]?.message || error.message || 'Error deleting product form service layer', 'Service Layer', error.errors || error);
        }
    }
}

export default new ProductService();
