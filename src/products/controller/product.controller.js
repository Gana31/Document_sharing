import { ApiError } from "../../../utils/ApiError.js";
import {ApiResponse} from "../../../utils/ApiResponse.js"
import ProductService from "../service/product.service.js"
import {asyncHandler} from "../../../utils/asynchandler.js"
class ProductController {

    createProduct = asyncHandler(async (req, res,next) => {
        try {
            const{body,files} = req;
            // console.log(body,files)
            console.log(body,files);
            if (!body.title || !body.description || !body.price || !body.stock|| !body.categories || !files ) {
                throw new ApiError(400, 'All Fields is required', 'Controller layer');
            }
            
            const  { product ,images} = await ProductService.createProduct(body,files);
            res.status(201).json(new ApiResponse(201, 'Product created successfully', [product,images]));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error creating product',"From Controller Layer", error.errors || error));
           
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


    updateProduct = asyncHandler(async (req, res) => {
        try {

            const updatedProduct = await ProductService.updateProduct(req.params.id, req.body, req.files);
            res.status(200).json(new ApiResponse(200, 'Product updated successfully', updatedProduct));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error updating product',"From Controller Layer", error.errors || error));
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
