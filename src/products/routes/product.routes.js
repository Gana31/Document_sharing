import express from "express"
import productController from "../controller/product.controller.js";
import { debugUploadMiddleware, upload } from "../../../config/multer.js";


const ProductRouter  = express.Router()

ProductRouter.post("/createproduct",upload,productController.createProduct);
ProductRouter.get("/getallproduct",productController.getAllProducts);
ProductRouter.get("/getproductbyid/:id",productController.getProductById);
ProductRouter.put("/updateproduct/:id",productController.updateProduct);
ProductRouter.delete("/deleteproduct/:id",productController.deleteProduct);


export default ProductRouter;