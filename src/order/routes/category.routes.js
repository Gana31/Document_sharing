import express from "express"
import { createCategory, deleteCategory, getAllCategories, getCategoryById, getProductsByCategoryId, getProductsByCategoryName, updateCategory } from "../controller/category.controller.js";


const CategoryRouter  = express.Router()

CategoryRouter.post("/createCategory",createCategory);
CategoryRouter.get("/getAllCategories",getAllCategories);
CategoryRouter.get("/getCategoryById/:id",getCategoryById);
CategoryRouter.put("/updateCategory/:id",updateCategory);
CategoryRouter.delete("/deleteCategory/:id",deleteCategory);
CategoryRouter.get('/products/name/:categoryName', getProductsByCategoryName);
CategoryRouter.get('/products/id/:categoryId', getProductsByCategoryId);
export default CategoryRouter;

