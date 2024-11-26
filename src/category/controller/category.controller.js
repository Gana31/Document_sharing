import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import categoryService from "../service/category.service.js";


export const createCategory = asyncHandler(async (req, res, next) => {
    try {

        const { name, description,userId } = req.body;

        if (!name || !description || !userId) {
            throw new ApiError(400, "All fields are required","Controller Layer");
        }
        const category = await categoryService.createCategory({ name, description,userId });
        res.status(201).json(new ApiResponse(201, "Category created successfully", category));
    } catch (error) {
        console.log(error)
        next( new ApiError(400, error.errors[0]?.message ||  error.message  || "Error while creating category","From Controller Layer", error.errors || error));
    }
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json(new ApiResponse(200, "Categories retrieved successfully", categories));
    } catch (error) {
        next(new ApiError(400, error.message || "Error while retrieving categories"));
        next( new ApiError(400, error.errors[0]?.message ||  error.message  || 'Error deleting record',"From Controller Layer", error.errors || error));
    }
});


export const getCategoryById = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        res.status(200).json(new ApiResponse(200, "Category retrieved successfully", category));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message ||  error.message  || "Error while retrieving category","From Controller Layer", error.errors || error));
    }
});


export const getCategoryByUserId = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoriesByUserId(id);
        res.status(200).json(new ApiResponse(200, "Category retrieved successfully", category));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message ||  error.message  || "Error while retrieving category","From Controller Layer", error.errors || error));
    }
});

export const updateCategory = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
 
        const updatedCategory = await categoryService.updateCategory(id, updatedData);
        res.status(200).json(new ApiResponse(200, "Category updated successfully",updatedCategory ));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message ||  error.message  ||"Error while updating category","From Controller Layer", error.errors || error));
    }
});


export const deleteCategory = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const {userId} = req.body;
        await categoryService.deleteCategory(id,userId);
        res.status(200).json(new ApiResponse(200, "Category deleted successfully"));
    } catch (error) {
        next( new ApiError(400, error.errors[0]?.message ||  error.message  || "Error while deleting category","From Controller Layer", error.errors || error));
    }
});



export const getProductsByCategoryName = asyncHandler(async (req, res, next) => {
    const { categoryName } = req.params;
    try {
        const products = await categoryService.getProductsByCategoryName(categoryName);
        res.status(200).json(new ApiResponse(200, "Products retrieved successfully", products));
    } catch (error) {
        next(new ApiError(400, error.message || "Error while retrieving products by category name"));
    }
});


export const getProductsByCategoryId = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    try {
        const products = await categoryService.getProductsByCategoryId(categoryId);
        res.status(200).json(new ApiResponse(200, "Products retrieved successfully", products));
    } catch (error) {
        next(new ApiError(400, error.message || "Error while retrieving products by category ID"));
    }
});