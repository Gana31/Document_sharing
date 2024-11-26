import express from "express"
import { createCategory, deleteCategory, getAllCategories, getCategoryById, getCategoryByUserId, getProductsByCategoryId, getProductsByCategoryName, updateCategory } from "../controller/category.controller.js";
import { authMiddleware } from "../../Middleware/authMiddleware.js";


const CategoryRouter  = express.Router()

CategoryRouter.post("/createCategory",authMiddleware,createCategory);
CategoryRouter.get("/getAllCategories",getAllCategories);
CategoryRouter.get("/getCategoryById/:id",getCategoryById);
CategoryRouter.put("/updateCategory/:id",authMiddleware,updateCategory);
CategoryRouter.delete("/deleteCategory/:id",authMiddleware,deleteCategory);
CategoryRouter.get('/products/name/:categoryName',getProductsByCategoryName);
CategoryRouter.get('/products/id/:categoryId', getProductsByCategoryId);
CategoryRouter.get('/getProductByUserId/:id',authMiddleware,getCategoryByUserId);

export default CategoryRouter;

