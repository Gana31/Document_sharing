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
        // console.log("............................>>>>>>>>>>>>>>>>>>>>>>>>>>",quantity)
        const product = await productRepository.findById(productId, { transaction });  // Pass transaction to the query
        if (!product) {
          throw new ApiError(404, `Product with ID ${productId} not found`, 'Service Layer');
        }

        if(product.access_mode == "offline"){
          if (product.stock < quantity) {
            throw new ApiError(400, `Insufficient stock for product ${productId}`, 'Service Layer');
          }
        product.stock -= quantity;
        await product.update({ stock: product.stock }, { transaction });
      }
      productOrderMappings.push({
        productId: product.id,
        quantity: quantity,
      });
      subtotal += product.price * quantity;
    }
    
      const shippingFee = subtotal > 1 ? Math.max(subtotal * 0.1, 200) : 0;
      const calculatedTotal = subtotal + shippingFee;
      console.log("......................>>>>>>>>>>>>>>>>>>>>>>>>..",frontendTotal,calculatedTotal)
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
      const orders1 = await orderRepository.findAll({
        where: { userId },
        include: [
          {
            model: ProductOrderMapping,
            as: 'orderMappings',
            include: [
              {
                model: ProductModel,
                as: 'productordermapping',
                attributes: ['id', 'title', 'price', 'access_mode'],
                include: [
                  {
                    model: ProductImages,
                    as: 'images',
                    attributes: ['url', 'id', 'modeltype'],
                    required: false,
                  }
                ]
              }
            ],
          }
        ],
        attributes: ['id', 'userId', 'totalPrice', 'orderDate'],
      });
  
      const orders = JSON.parse(JSON.stringify(orders1));
  
      // Iterate over the orders and their mappings to add `pdflink` field and keep images
      const enhancedOrders = orders.map(order => {
        order.orderMappings.forEach(mapping => {
          // Initialize `pdflink` as an empty array
          mapping.pdflink = [];
  
          // Filter out the PDF images from the `images` field
          mapping.productordermapping.images = mapping.productordermapping.images.filter(image => {
            if (image.modeltype === 'pdf') {
              // If the image is a PDF, add it to the `pdflink` field
              mapping.pdflink.push({
                id: image.id,
                url: image.url,
                modeltype: image.modeltype,
              });
              // Return false to exclude the image from `images`
              return false;
            }
            // Keep the non-PDF images in the `images` field
            return true;
          });
        });
        return order;
      });
  
      return enhancedOrders;
  
    } catch (error) {
      throw new ApiError(400, error.errors[0]?.message || error.message || "Error fetching previous orders", 'Service Layer', error.errors || error);
    }
  }
  
  
}


export default new OrderService();
