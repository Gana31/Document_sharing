import express from "express"
import productController from "../controller/product.controller.js";


const ProductRouter  = express.Router()

ProductRouter.post("/createproduct",productController.createProduct);
ProductRouter.get("/getallproduct",productController.getAllProducts);
ProductRouter.get("/getproductbyid/:id",productController.getProductById);
ProductRouter.put("/updateproduct/:id",productController.updateProduct);
ProductRouter.delete("/deleteproduct/:id",productController.deleteProduct);


export default ProductRouter;