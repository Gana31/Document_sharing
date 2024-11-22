import { ApiError } from "../../../utils/ApiError.js";
import { ProductRepository } from "../../products/index.js";
import OrderRepository from "../repository/order.repository.js";
import {OrderModel, ProductImages, ProductModel, ProductOrderMapping} from '../../dbrelation.js'

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository();


    class OrderService {
        async createOrder(userId, products, frontendTotal) {
            try {
                // console.log(userId,products,frontendTotal)
              let subtotal = 0;
              const productOrderMappings = [];
        
              for (const { productId, quantity } of products) {
                const product = await productRepository.findById(productId);
                if (!product) {
                  throw new ApiError(404, `Product with ID ${productId} not found`, 'Service Layer');
                }
        
                // Calculate product total price
                subtotal += product.price * quantity;
                productOrderMappings.push({
                  productId: product.id,
                  quantity: quantity,
                });
              }

              const shippingFee = subtotal > 1 ? Math.max(subtotal * 0.1, 200) : 0;
        
              const calculatedTotal = subtotal + shippingFee;

              if (frontendTotal !== calculatedTotal) {
                throw new ApiError(400, "Total price mismatch. Please review your order and try again.", 'Service Layer');
              }

              const order = await orderRepository.create({
                userId,
                totalPrice: calculatedTotal,
              });
        
              for (const mapping of productOrderMappings) {
                await ProductOrderMapping.create({
                  orderId: order.id,
                  productId: mapping.productId,
                  quantity: mapping.quantity,
                });
              }
        
              return order;
            } catch (error) {
                
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
                    as: 'orderMappings',  // Alias for the relation in OrderModel.hasMany(ProductOrderMapping)
                    include: [
                      {
                        model: ProductModel,
                        as: 'productordermapping',  // Alias for ProductModel in ProductOrderMapping
                        attributes: ['id', 'title', 'price'],  // Fetch the product details like id, title, price
                        include: [
                          {
                            model: ProductImages,
                            as: 'images',  // Alias for ProductImages in ProductModel
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
              console.log(error);
              throw new ApiError(400, error.message || "Error fetching previous orders", "Service Layer", error);
            }
          }
          
          
      
    }
    
export default new OrderService();
