import { Request, Response } from 'express';
import { PrismaClient, ConciergeRequestStatus } from '@prisma/client';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Validation schemas
const createConciergeRequestSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeAddress: z.string().min(1, 'Store address is required'),
  items: z.array(z.object({
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  deliveryAddress: z.string().min(1, 'Delivery address is required'),
  deliveryInstructions: z.string().optional(),
});

const rateConciergeRequestSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

// Create a new concierge request
export const createConciergeRequest = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const validatedData = createConciergeRequestSchema.parse(req.body);

  // Calculate estimated amount (rough estimate)
  const estimatedAmount = validatedData.items.reduce((sum, item) => {
    return sum + (item.quantity * 15); // Rough estimate of ₹15 per item
  }, 0);

  // Create concierge request
  const conciergeRequest = await prisma.conciergeRequest.create({
    data: {
      customerId,
      storeName: validatedData.storeName,
      storeAddress: validatedData.storeAddress,
      items: validatedData.items,
      estimatedAmount,
      status: ConciergeRequestStatus.PENDING,
      deliveryAddress: validatedData.deliveryAddress,
      deliveryInstructions: validatedData.deliveryInstructions,
    }
  });

  logger.info('Concierge request created successfully', {
    conciergeRequestId: conciergeRequest.id,
    customerId,
    storeName: validatedData.storeName,
    itemCount: validatedData.items.length,
    estimatedAmount
  });

  res.status(201).json({
    success: true,
    message: 'Concierge request created successfully',
    data: { conciergeRequest }
  });
});

// Get customer concierge requests
export const getCustomerConciergeRequests = asyncHandler(async (req: Request, res: Response) => {
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

  if (status && Object.values(ConciergeRequestStatus).includes(status as ConciergeRequestStatus)) {
    where.status = status;
  }

  const conciergeRequests = await prisma.conciergeRequest.findMany({
    where,
    include: {
      rider: {
        select: {
          id: true,
          name: true,
          phone: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.conciergeRequest.count({ where });

  logger.info('Customer concierge requests retrieved successfully', {
    customerId,
    count: conciergeRequests.length,
    total
  });

  res.status(200).json({
    success: true,
    message: 'Customer concierge requests retrieved successfully',
    data: {
      conciergeRequests,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      }
    }
  });
});

// Get concierge request by ID
export const getConciergeRequestById = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const conciergeRequest = await prisma.conciergeRequest.findFirst({
    where: {
      id,
      customerId,
    },
    include: {
      rider: {
        select: {
          id: true,
          name: true,
          phone: true,
        }
      }
    }
  });

  if (!conciergeRequest) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CONCIERGE_REQUEST_NOT_FOUND',
        message: 'Concierge request not found',
      }
    });
  }

  logger.info('Concierge request retrieved successfully', { conciergeRequestId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Concierge request retrieved successfully',
    data: { conciergeRequest }
  });
});

// Cancel concierge request
export const cancelConciergeRequest = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;

  const conciergeRequest = await prisma.conciergeRequest.findFirst({
    where: {
      id,
      customerId,
      status: {
        in: [ConciergeRequestStatus.PENDING, ConciergeRequestStatus.ACCEPTED]
      }
    }
  });

  if (!conciergeRequest) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CONCIERGE_REQUEST_NOT_FOUND',
        message: 'Concierge request not found or cannot be cancelled',
      }
    });
  }

  const updatedConciergeRequest = await prisma.conciergeRequest.update({
    where: { id },
    data: {
      status: ConciergeRequestStatus.CANCELLED,
    }
  });

  logger.info('Concierge request cancelled successfully', { conciergeRequestId: id, customerId });

  res.status(200).json({
    success: true,
    message: 'Concierge request cancelled successfully',
    data: { conciergeRequest: updatedConciergeRequest }
  });
});

// Rate concierge request
export const rateConciergeRequest = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const { id } = req.params;
  const validatedData = rateConciergeRequestSchema.parse(req.body);

  const conciergeRequest = await prisma.conciergeRequest.findFirst({
    where: {
      id,
      customerId,
      status: ConciergeRequestStatus.COMPLETED,
    }
  });

  if (!conciergeRequest) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CONCIERGE_REQUEST_NOT_FOUND',
        message: 'Concierge request not found or not completed',
      }
    });
  }

  if (conciergeRequest.customerRating) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ALREADY_RATED',
        message: 'Concierge request has already been rated',
      }
    });
  }

  const updatedConciergeRequest = await prisma.conciergeRequest.update({
    where: { id },
    data: {
      customerRating: validatedData.rating,
      customerReview: validatedData.review,
    }
  });

  logger.info('Concierge request rated successfully', { 
    conciergeRequestId: id, 
    customerId, 
    rating: validatedData.rating 
  });

  res.status(200).json({
    success: true,
    message: 'Concierge request rated successfully',
    data: { conciergeRequest: updatedConciergeRequest }
  });
});
