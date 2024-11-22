import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { asyncHandler } from "../../../utils/asynchandler.js";
import orderService from "../service/order.service.js";

// Controller for creating an order
export const createOrder = asyncHandler(async (req, res, next) => {
    try {
        // console.log("Create order call");
        const { userId, products, frontendTotal } = req.body;
        if (!userId || !products || !frontendTotal) {
            throw new ApiError(400, "All fields are required");
        }
        const order = await orderService.createOrder(userId, products, frontendTotal);
        res.status(201).json(new ApiResponse(201, "Order created successfully", order));
    } catch (error) {
        next(new ApiError(400, error.errors[0]?.message || error.message || 'Error creating order', 'Controller Layer', error.errors || error));
    }
});

// Controller for fetching previous orders
export const getPreviousOrders = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        // console.log(id)
        if (!id) {
            throw new ApiError(400, "User ID is required");
        }

        const previousOrders = await orderService.getPreviousOrders(id);
        
        // If no orders found
        if (!previousOrders || previousOrders.length === 0) {
            throw new ApiError(404, "No previous orders found for this user");
        }

        res.status(200).json(new ApiResponse(200, "Previous orders fetched successfully", previousOrders));
    } catch (error) {
        next(new ApiError(400, error.errors[0]?.message || error.message || 'Error fetching previous orders', 'Controller Layer', error.errors || error));
    }
});
