import express from "express"
import { createOrder, getPreviousOrders } from "../controller/order.controller.js";

const OrderRouter  = express.Router()

OrderRouter.post("/createOrder",createOrder);
OrderRouter.get("/getAllPreviousOrders/:id",getPreviousOrders);

export default OrderRouter;

