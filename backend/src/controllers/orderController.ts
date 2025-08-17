import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.string().default('CASH_ON_DELIVERY'),
});

const rateOrderSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

// Create a new order
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const validatedData = createOrderSchema.parse(req.body);

  // Verify store exists and is active
  const store = await prisma.store.findFirst({
    where: {
      id: validatedData.storeId,
      isActive: true,
    }
  });

  if (!store) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'STORE_NOT_FOUND',
        message: 'Store not found or inactive',
      }
    });
  }

  // Verify all products exist and are available
  const productIds = validatedData.items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      storeId: validatedData.storeId,
      isAvailable: true,
    }
  });

  if (products.length !== productIds.length) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PRODUCTS',
        message: 'Some products are not available or do not exist',
      }
    });
  }

  // Calculate order totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of validatedData.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) continue;

    const totalPrice = product.price * item.quantity;
    subtotal += totalPrice;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
      totalPrice,
      notes: item.notes,
    });
  }

  const deliveryFee = store.deliveryFee;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;

  // Check minimum order amount
  if (subtotal < store.minOrderAmount) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MIN_ORDER_NOT_MET',
        message: `Minimum order amount is ₹${store.minOrderAmount}`,
      }
    });
  }

  // Create order with items
  const order = await prisma.order.create({
    data: {
      customerId,
      storeId: validatedData.storeId,
      status: OrderStatus.PENDING,
      subtotal,
      deliveryFee,
      tax,
      total,
      deliveryAddress: validatedData.deliveryAddress,
      deliveryInstructions: validatedData.deliveryInstructions,
      paymentMethod: validatedData.paymentMethod,
      estimatedDeliveryTime: new Date(Date.now() + store.estimatedDeliveryTime * 60000), // Convert minutes to milliseconds
      items: {
        create: orderItems,
      }
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              unit: true,
            }
          }
        }
      }
    }
  });

  logger.info('Order created successfully', {
    orderId: order.id,
    customerId,
    storeId: validatedData.storeId,
    total
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

// Get customer orders
export const getCustomerOrders = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { 
    status, 
    limit = '20', 
    offset = '0' 
  } = req.query;

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Build where clause
  const where: any = {
    customerId,
  };

  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              unit: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.order.count({ where });

  logger.info('Customer orders retrieved successfully', {
    customerId,
    count: orders.length,
    total
  });

  res.status(200).json({
    success: true,
    message: 'Customer orders retrieved successfully',
    data: {
      orders,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      }
    }
  });
});

// Get order by ID
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId,
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
          address: true,
          city: true,
          phone: true,
        }
      },
      rider: {
        select: {
          id: true,
          name: true,
          phone: true,
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              unit: true,
              description: true,
            }
          }
        }
      }
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      }
    });
  }

  logger.info('Order retrieved successfully', { orderId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Order retrieved successfully',
    data: { order }
  });
});

// Cancel order
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId,
      status: {
        in: [OrderStatus.PENDING, OrderStatus.CONFIRMED]
      }
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found or cannot be cancelled',
      }
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: OrderStatus.CANCELLED,
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  logger.info('Order cancelled successfully', { orderId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order: updatedOrder }
  });
});

// Rate order
export const rateOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;
  const validatedData = rateOrderSchema.parse(req.body);

  const order = await prisma.order.findFirst({
    where: {
      id,
      customerId,
      status: OrderStatus.DELIVERED,
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found or not delivered',
      }
    });
  }

  if (order.customerRating) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ALREADY_RATED',
        message: 'Order has already been rated',
      }
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      customerRating: validatedData.rating,
      customerReview: validatedData.review,
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  // Update store rating
  const storeOrders = await prisma.order.findMany({
    where: {
      storeId: order.storeId,
      customerRating: { not: null },
    },
    select: {
      customerRating: true,
    }
  });

  const averageRating = storeOrders.reduce((sum, o) => sum + (o.customerRating || 0), 0) / storeOrders.length;

  await prisma.store.update({
    where: { id: order.storeId },
    data: {
      rating: averageRating,
      totalRatings: storeOrders.length,
    }
  });

  logger.info('Order rated successfully', { 
    orderId: id, 
    customerId, 
    rating: validatedData.rating 
  });

  res.status(200).json({
    success: true,
    message: 'Order rated successfully',
    data: { order: updatedOrder }
  });
});
