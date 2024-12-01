import { ApiError } from "../../../utils/ApiError.js";
import { ProductRepository } from "../../products/index.js";
import OrderRepository from "../repository/order.repository.js";
import { OrderModel, ProductImages, ProductModel, ProductOrderMapping } from '../../dbrelation.js';
import { Op } from 'sequelize'; // For handling queries in Sequelize
import CryptoJS from "crypto-js";
import Razorpay from "razorpay";
import ServerConfig from "../../../config/ServerConfig.js";
const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();

const razorpayInstance = new Razorpay({
  key_id: ServerConfig.RAZORPAY_KEY,  // Replace with your Razorpay Key ID
  key_secret: ServerConfig.RAZORPAY_SECRET,  // ReplacWe with your Razorpay Key Secret
});


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
  
        // Create Razorpay order
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: Math.round(calculatedTotal * 100), // Amount in paise
          currency: "INR",
          receipt: order.id,
        });
  
        order.razorpayorderid = razorpayOrder.id;
        await order.save({ transaction });
  
        await transaction.commit();
  
        return {
          razorpayOrderId: razorpayOrder.id,
          amount: calculatedTotal,
          currency: razorpayOrder.currency,
          products,
        };
      } catch (error) {
        await transaction.rollback();
  
        if (error instanceof ApiError && error.message === 'Total price mismatch') {
          await orderRepository.delete(order.id); // Delete the order in case of mismatch
        }
        
        throw new ApiError(400, error.errors[0]?.message || error.message || 'Error creating order', 'Service Layer', error.errors || error);
      }
    }
    async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
      try {
        const order = await orderRepository.model.findOne({ where: { razorpayorderid: razorpayOrderId } });
        if (!order) {
          throw new ApiError(404, "Order not found", "Service Layer");
        }
    
        // Step 1: Check if the payment is verified within the allowed time (e.g., 15 minutes)
        const createdAt = new Date(order.createdAt);
        const currentTime = new Date();
        const timeDifference = (currentTime - createdAt) / 1000 / 60; // in minutes
    
        if (timeDifference > 15) {  // If it's more than 15 minutes since creation, mark as expired
          await order.update({ paymentStatus: "UnPaid" });  // Mark the order as expired or delete it
          await order.destroy();  // Alternatively, you can delete the order
          throw new ApiError(400, "Payment time expired", "Service Layer");
        }
    
        // Step 2: Generate the expected signature using your Razorpay secret
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const secret = process.env.RAZORPAY_SECRET;
        
        const expectedSignature = CryptoJS.HmacSHA256(body, secret).toString(CryptoJS.enc.Hex);
        
        // Step 3: Compare the expected signature with the one sent by Razorpay
        if (expectedSignature !== razorpaySignature) {
          // Signature mismatch, delete the order
          await order.destroy();  // Delete the order if payment verification fails
          throw new ApiError(400, "Invalid Razorpay signature", "Service Layer");
        }
    
        // Step 4: Update the order status to "Paid"
        await order.update({ paymentstatus: "Paid" });
    
        return { message: "Payment verified successfully", orderId: order.id };
      } catch (error) {
        console.log(error);
        // Rollback and delete the order if any error occurs
        const order = await orderRepository.model.findOne({ where: { razorpayorderid: razorpayOrderId } });
        if (order) {
          await order.destroy();  // Delete the order if there is any error
        }
        throw new ApiError(400, error.message || "Payment verification failed", "Service Layer");
      }
    }
  

  async getPreviousOrders(userId) {
    try {
      // Fetch orders for the user, include related models
      const orders1 = await orderRepository.findAll({
        where: { userId ,
          paymentstatus: 'Paid',
        },
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
        attributes: ['id', 'userId', 'totalPrice', 'orderDate','paymentstatus'],
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
