import { ApiError } from "../../../utils/ApiError.js";
import {ApiResponse} from "../../../utils/ApiResponse.js"
import ProductService from "../service/product.service.js"
import {asyncHandler} from "../../../utils/asynchandler.js"
class ProductController {

    createProduct = asyncHandler(async (req, res, next) => {
        try {
            const { body, files } = req;
    
            // Validate mandatory fields for all products
            if (!body.title || !body.description || !body.price || !body.categories) {
                throw new ApiError(400, 'All fields are required', 'Controller Layer');
            }
    
            console.log(files); // This will log both 'images' and 'document' fields
    
            let pdfFile = null;
            const imageFiles = [];
    
            // Separate PDF/Word file and images
            if (files.document) {
                pdfFile = files.document[0]; // Get the document (PDF/Word)
            }
    
            if (files.images) {
                files.images.forEach((file) => {
                    imageFiles.push(file); // Collect image files
                });
            }
    
            // Validate specific to online mode
            if (body.access_mode === 'online' && !pdfFile) {
                throw new ApiError(
                    400,
                    'Online products require at least one PDF or Word file',
                    'Controller Layer'
                );
            }
    
            // If access_mode is 'offline', you don't need the document field
            if (body.access_mode === 'offline' && pdfFile) {
                throw new ApiError(400, 'Offline products should not have a document file', 'Controller Layer');
            }
    
            // Call the service layer to handle the product creation
            const { product, images, pdf } = await ProductService.createProduct(body, imageFiles, pdfFile);
    
            // Return a success response
            res.status(201).json(
                new ApiResponse(201, 'Product created successfully', { product, images, pdf })
            );
        } catch (error) {
            console.log(error);
            next(
                new ApiError(
                    400,
                    error.errors?.[0]?.message || error.message || 'Error creating product',
                    'From Controller Layer',
                    error.errors || error
                )
            );
        }
    });
    
    
    


    getProductById = asyncHandler(async (req, res) => {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                throw new ApiError(404, 'Product not found',"Controller Layer");
            }
            res.status(200).json(new ApiResponse(200, 'Product retrieved successfully', product));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error fetching product',"From Controller Layer", error.errors || error));
        }
    });


    getAllProducts = asyncHandler(async (req, res) => {
        try {
            const products = await ProductService.getAllProducts();
            res.status(200).json(new ApiResponse(200, 'Products retrieved successfully', products));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error fetching products',"From Controller Layer", error.errors || error));
        }
    });
     getProductsByName = asyncHandler(async (req, res, next) => {
        const { query } = req.query;  
        // console.log('Search query:', query);  
        const { limit = 10, page = 1 } = req.query;  
    
        try {
            const products = await ProductService.searchProductsByName(query, limit, page);
            res.status(200).json(new ApiResponse(200, 'Products retrieved successfully', products));
        } catch (error) {
            next(new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching products by name', "From Controller Layer", error.errors || error));
        }
    });

    getAllProductsList = asyncHandler(async (req, res) => {
        try {
            const products = await ProductService.getAllProductsList();
            res.status(200).json(new ApiResponse(200, 'Products retrieved successfully', products));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error fetching products',"From Controller Layer", error.errors || error));
        }
    });
    getAllProductsByUserId = asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const products = await ProductService.getAllProductsByUserId(id);
            res.status(200).json(new ApiResponse(200, 'Products retrieved successfully', products));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error fetching products',"From Controller Layer", error.errors || error));
        }
    });


    updateProduct = asyncHandler(async (req, res, next) => {
        try {
            const { access_mode } = req.body;  // Extract access_mode and document
            const files = req.files || []; // Image(s) and document(s)
    
            // If access mode is 'offline', nullify the document field in req.body
            if (access_mode === 'offline') {
                req.body.document = null;
            }
    
            console.log(req.body, files); // Logs the incoming data
    
            // Call the service method with the required data
            const updatedProduct = await ProductService.updateProduct(req.params.id, req.body, files);
    
            // Send the response
            res.status(200).json(new ApiResponse(200, 'Product updated successfully', updatedProduct));
    
        } catch (error) {
            next(new ApiError(400, error.errors[0]?.message || error.message || 'Error updating product', "From Controller Layer", error.errors || error));
        }
    });
    

    deleteProduct = asyncHandler(async (req, res,next) => {
        try {
            const response = await ProductService.deleteProduct(req.params.id);
            res.status(200).json(new ApiResponse(200, 'Product deleted successfully', response));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error deleting record',"From Controller Layer", error.errors || error));
          
        }
    });
}

export default new ProductController();
