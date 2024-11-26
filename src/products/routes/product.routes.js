import express from "express"
import productController from "../controller/product.controller.js";
import { debugUploadMiddleware, upload } from "../../../config/multer.js";
import { authMiddleware } from "../../Middleware/authMiddleware.js";


const ProductRouter  = express.Router()

ProductRouter.post("/createproduct",authMiddleware,upload,productController.createProduct);
ProductRouter.get("/getallproduct",productController.getAllProducts);
ProductRouter.get("/getproductbyid/:id",productController.getProductById);
ProductRouter.put("/updateproduct/:id",authMiddleware,upload,productController.updateProduct);
ProductRouter.delete("/deleteproduct/:id",authMiddleware,productController.deleteProduct);
ProductRouter.get("/getallproductByUserId/:id",authMiddleware,productController.getAllProductsByUserId);


export default ProductRouter;