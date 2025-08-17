import { Request, Response } from 'express';
import { PrismaClient, MultiStopOrderStatus } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Validation schemas
const createMultiStopOrderSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  deliveryInstructions: z.string().optional(),
  stops: z.array(z.object({
    storeName: z.string().min(1, 'Store name is required'),
    storeAddress: z.string().optional(),
    items: z.array(z.object({
      name: z.string().min(1, 'Item name is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unit: z.string().optional(),
      notes: z.string().optional(),
    })).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  })).min(1, 'At least one stop is required'),
});

const updateMultiStopOrderSchema = z.object({
  name: z.string().min(1, 'Plan name is required').optional(),
  description: z.string().optional(),
  deliveryAddress: z.string().min(1, 'Delivery address is required').optional(),
  deliveryInstructions: z.string().optional(),
  stops: z.array(z.object({
    id: z.string().optional(), // For existing stops
    storeName: z.string().min(1, 'Store name is required'),
    storeAddress: z.string().optional(),
    items: z.array(z.object({
      name: z.string().min(1, 'Item name is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unit: z.string().optional(),
      notes: z.string().optional(),
    })).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  })).min(1, 'At least one stop is required').optional(),
});

// Create a new multi-stop order
export const createMultiStopOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const validatedData = createMultiStopOrderSchema.parse(req.body);

  // Calculate total estimated amount
  let totalAmount = 0;
  const stops = [];

  for (let i = 0; i < validatedData.stops.length; i++) {
    const stop = validatedData.stops[i];
    const estimatedAmount = stop.items.reduce((sum, item) => sum + (item.quantity * 10), 0); // Rough estimate
    totalAmount += estimatedAmount;

    stops.push({
      storeName: stop.storeName,
      storeAddress: stop.storeAddress,
      stopOrder: i + 1,
      items: stop.items,
      estimatedAmount,
      notes: stop.notes,
    });
  }

  // Create multi-stop order with stops
  const multiStopOrder = await prisma.multiStopOrder.create({
    data: {
      customerId,
      name: validatedData.name,
      description: validatedData.description,
      status: MultiStopOrderStatus.DRAFT,
      totalAmount,
      deliveryAddress: validatedData.deliveryAddress,
      deliveryInstructions: validatedData.deliveryInstructions,
      stops: {
        create: stops,
      }
    },
    include: {
      stops: {
        orderBy: {
          stopOrder: 'asc'
        }
      }
    }
  });

  logger.info('Multi-stop order created successfully', {
    multiStopOrderId: multiStopOrder.id,
    customerId,
    stopCount: stops.length,
    totalAmount
  });

  res.status(201).json({
    success: true,
    message: 'Multi-stop order created successfully',
    data: { multiStopOrder }
  });
});

// Get customer multi-stop orders
export const getCustomerMultiStopOrders = asyncHandler(async (req: Request, res: Response) => {
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

  if (status && Object.values(MultiStopOrderStatus).includes(status as MultiStopOrderStatus)) {
    where.status = status;
  }

  const multiStopOrders = await prisma.multiStopOrder.findMany({
    where,
    include: {
      stops: {
        orderBy: {
          stopOrder: 'asc'
        }
      },
      _count: {
        select: {
          stops: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.multiStopOrder.count({ where });

  logger.info('Customer multi-stop orders retrieved successfully', {
    customerId,
    count: multiStopOrders.length,
    total
  });

  res.status(200).json({
    success: true,
    message: 'Customer multi-stop orders retrieved successfully',
    data: {
      multiStopOrders,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      }
    }
  });
});

// Get multi-stop order by ID
export const getMultiStopOrderById = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const multiStopOrder = await prisma.multiStopOrder.findFirst({
    where: {
      id,
      customerId,
    },
    include: {
      stops: {
        orderBy: {
          stopOrder: 'asc'
        }
      }
    }
  });

  if (!multiStopOrder) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MULTI_STOP_ORDER_NOT_FOUND',
        message: 'Multi-stop order not found',
      }
    });
  }

  logger.info('Multi-stop order retrieved successfully', { multiStopOrderId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Multi-stop order retrieved successfully',
    data: { multiStopOrder }
  });
});

// Update multi-stop order
export const updateMultiStopOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;
  const validatedData = updateMultiStopOrderSchema.parse(req.body);

  // Check if multi-stop order exists and belongs to customer
  const existingMultiStopOrder = await prisma.multiStopOrder.findFirst({
    where: {
      id,
      customerId,
      status: MultiStopOrderStatus.DRAFT,
    }
  });

  if (!existingMultiStopOrder) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MULTI_STOP_ORDER_NOT_FOUND',
        message: 'Multi-stop order not found or cannot be updated',
      }
    });
  }

  // Start transaction for updating
  const updatedMultiStopOrder = await prisma.$transaction(async (tx) => {
    // Update basic info
    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.deliveryAddress) updateData.deliveryAddress = validatedData.deliveryAddress;
    if (validatedData.deliveryInstructions !== undefined) updateData.deliveryInstructions = validatedData.deliveryInstructions;

    // If stops are provided, update them
    if (validatedData.stops) {
      // Delete existing stops
      await tx.multiStopOrderStop.deleteMany({
        where: { multiStopOrderId: id }
      });

      // Calculate new total amount
      let totalAmount = 0;
      const stops = [];

      for (let i = 0; i < validatedData.stops.length; i++) {
        const stop = validatedData.stops[i];
        const estimatedAmount = stop.items.reduce((sum, item) => sum + (item.quantity * 10), 0);
        totalAmount += estimatedAmount;

        stops.push({
          storeName: stop.storeName,
          storeAddress: stop.storeAddress,
          stopOrder: i + 1,
          items: stop.items,
          estimatedAmount,
          notes: stop.notes,
        });
      }

      updateData.totalAmount = totalAmount;

      // Create new stops
      await tx.multiStopOrderStop.createMany({
        data: stops.map(stop => ({
          ...stop,
          multiStopOrderId: id,
        }))
      });
    }

    // Update multi-stop order
    return await tx.multiStopOrder.update({
      where: { id },
      data: updateData,
      include: {
        stops: {
          orderBy: {
            stopOrder: 'asc'
          }
        }
      }
    });
  });

  logger.info('Multi-stop order updated successfully', { multiStopOrderId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Multi-stop order updated successfully',
    data: { multiStopOrder: updatedMultiStopOrder }
  });
});

// Delete multi-stop order
export const deleteMultiStopOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const multiStopOrder = await prisma.multiStopOrder.findFirst({
    where: {
      id,
      customerId,
      status: MultiStopOrderStatus.DRAFT,
    }
  });

  if (!multiStopOrder) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MULTI_STOP_ORDER_NOT_FOUND',
        message: 'Multi-stop order not found or cannot be deleted',
      }
    });
  }

  // Delete multi-stop order (cascade will delete stops)
  await prisma.multiStopOrder.delete({
    where: { id }
  });

  logger.info('Multi-stop order deleted successfully', { multiStopOrderId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Multi-stop order deleted successfully',
  });
});

// Submit multi-stop order
export const submitMultiStopOrder = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const multiStopOrder = await prisma.multiStopOrder.findFirst({
    where: {
      id,
      customerId,
      status: MultiStopOrderStatus.DRAFT,
    },
    include: {
      stops: {
        orderBy: {
          stopOrder: 'asc'
        }
      }
    }
  });

  if (!multiStopOrder) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'MULTI_STOP_ORDER_NOT_FOUND',
        message: 'Multi-stop order not found or cannot be submitted',
      }
    });
  }

  if (multiStopOrder.stops.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_STOPS',
        message: 'Multi-stop order must have at least one stop',
      }
    });
  }

  // Update status to submitted
  const updatedMultiStopOrder = await prisma.multiStopOrder.update({
    where: { id },
    data: {
      status: MultiStopOrderStatus.SUBMITTED,
    },
    include: {
      stops: {
        orderBy: {
          stopOrder: 'asc'
        }
      }
    }
  });

  logger.info('Multi-stop order submitted successfully', { 
    multiStopOrderId: id, 
    customerId,
    stopCount: multiStopOrder.stops.length
  });

  res.status(200).json({
    success: true,
    message: 'Multi-stop order submitted successfully',
    data: { multiStopOrder: updatedMultiStopOrder }
  });
});
