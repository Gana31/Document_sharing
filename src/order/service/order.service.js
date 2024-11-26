import { ApiError } from "../../../utils/ApiError.js";
import { ProductRepository } from "../../products/index.js";
import OrderRepository from "../repository/order.repository.js";
import { OrderModel, ProductImages, ProductModel, ProductOrderMapping } from '../../dbrelation.js';
import { Op } from 'sequelize'; // For handling queries in Sequelize

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();

class OrderService {
  async createOrder(userId, products, frontendTotal) {
    const transaction = await OrderModel.sequelize.transaction();  // Start a new transaction
    try {
      let subtotal = 0;
      const productOrderMappings = [];

      // Loop through products and handle stock reduction
      for (const { productId, quantity } of products) {
        const product = await productRepository.findById(productId, { transaction });  // Pass transaction to the query
        if (!product) {
          throw new ApiError(404, `Product with ID ${productId} not found`, 'Service Layer');
        }

        if (product.stock < quantity) {
          throw new ApiError(400, `Insufficient stock for product ${productId}`, 'Service Layer');
        }

        // Calculate product total price
        subtotal += product.price * quantity;
        productOrderMappings.push({
          productId: product.id,
          quantity: quantity,
        });

        // Decrease the stock by the ordered quantity
        product.stock -= quantity;
        await product.update({ stock: product.stock }, { transaction });
      }

      const shippingFee = subtotal > 1 ? Math.max(subtotal * 0.1, 200) : 0;
      const calculatedTotal = subtotal + shippingFee;

      if (frontendTotal !== calculatedTotal) {
        throw new ApiError(400, "Total price mismatch. Please review your order and try again.", 'Service Layer');
      }

      // Create the order
      const order = await orderRepository.create({
        userId,
        totalPrice: calculatedTotal,
      }, { transaction });

      // Create mappings for order and products
      for (const mapping of productOrderMappings) {
        await ProductOrderMapping.create({
          orderId: order.id,
          productId: mapping.productId,
          quantity: mapping.quantity,
        }, { transaction });
      }

      // Commit the transaction
      await transaction.commit();

      return order;
    } catch (error) {
      // Rollback the transaction if any error occurs
      await transaction.rollback();
      throw new ApiError(400, error.errors[0]?.message || error.message || 'Error creating order', 'Service Layer', error.errors || error);
    }
  }

  async getPreviousOrders(userId) {
    try {
      // Fetch orders for the user, include related models
      const orders = await orderRepository.findAll({
        where: { userId },
        include: [
          {
            model: ProductOrderMapping,
            as: 'orderMappings',
            include: [
              {
                model: ProductModel,
                as: 'productordermapping',
                attributes: ['id', 'title', 'price'],
                include: [
                  {
                    model: ProductImages,
                    as: 'images',
                    attributes: ['url'],
                  }
                ]
              }
            ],
          }
        ],
        attributes: ['id', 'userId', 'totalPrice', 'orderDate'],
      });

      return orders;
    } catch (error) {
      throw new ApiError(400, error.errors[0]?.message || error.message || "Error fetching previous orders", 'Service Layer', error.errors || error);
    }
  }
}

export default new OrderService();
