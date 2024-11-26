import express from "express"
import { createOrder, getPreviousOrders } from "../controller/order.controller.js";
import { authMiddleware } from "../../Middleware/authMiddleware.js";

const OrderRouter  = express.Router()

OrderRouter.post("/createOrder",authMiddleware,createOrder);
OrderRouter.get("/getAllPreviousOrders/:id",authMiddleware,getPreviousOrders);

export default OrderRouter;

