import { ApiError } from "../../../utils/ApiError.js";
import {ApiResponse} from "../../../utils/ApiResponse.js"
import ProductService from "../service/product.service.js"
import {asyncHandler} from "../../../utils/asynchandler.js"
class ProductController {

    createProduct = asyncHandler(async (req, res,next) => {
        try {
            const{body,files} = req;
            // console.log(body,files)
            if (!body.title || !body.description || !body.price || !body.stock || !body.createdBy || !body.categories || !files ) {
                throw new ApiError(400, 'All Fields is required', 'Controller layer');
            }
            
            const  { product ,images} = await ProductService.createProduct(body,files);
            res.status(201).json(new ApiResponse(201, 'Product created successfully', [product,images]));
        } catch (error) {
            // console.log(error)
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error creating product',"From Controller Layer", error.errors || error));
           
        }
    });


    getProductById = asyncHandler(async (req, res) => {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                throw new ApiError(404, 'Product not found');
            }
            res.status(200).json(new ApiResponse(200, 'Product retrieved successfully', product));
        } catch (error) {
            throw new ApiError(400, error.message || 'Error fetching product');
        }
    });


    getAllProducts = asyncHandler(async (req, res) => {
        try {
            const products = await ProductService.getAllProducts();
            res.status(200).json(new ApiResponse(200, 'Products retrieved successfully', products));
        } catch (error) {
            throw new ApiError(400, error.message || 'Error fetching products');
        }
    });
    getAllProductsByUserId = asyncHandler(async (req, res) => {
        const { id } = req.params;
        console.log(id)
        try {
            const products = await ProductService.getAllProductsByUserId(id);
            res.status(200).json(new ApiResponse(200, 'Products retrieved successfully', products));
        } catch (error) {
            throw new ApiError(400, error.message || 'Error fetching products');
        }
    });


    updateProduct = asyncHandler(async (req, res) => {
        try {
            // console.log("update proudcta",req.params.id, req.body, req.files)
            const updatedProduct = await ProductService.updateProduct(req.params.id, req.body, req.files);
            res.status(200).json(new ApiResponse(200, 'Product updated successfully', updatedProduct));
        } catch (error) {
            res.status(400).json(new ApiResponse(400, error.message || 'Error updating product'));
        }
    });
    // Delete Product
    deleteProduct = asyncHandler(async (req, res,next) => {
        try {
            const response = await ProductService.deleteProduct(req.params.id);
            res.status(200).json(new ApiResponse(200, 'Product deleted successfully', response));
        } catch (error) {
            next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error deleting record',"From Controller Layer", error.errors || error));
            // throw new ApiError(400, error.message || 'Error deleting product');
        }
    });
}

export default new ProductController();
