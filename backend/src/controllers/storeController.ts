import { Request, Response } from 'express';
import { PrismaClient, StoreCategory } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Get all active stores with optional filtering
export const getStores = asyncHandler(async (req: Request, res: Response) => {
  const { 
    category, 
    city, 
    pincode, 
    limit = '20', 
    offset = '0',
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Build where clause
  const where: any = {
    isActive: true,
  };

  if (category && Object.values(StoreCategory).includes(category as StoreCategory)) {
    where.category = category;
  }

  if (city) {
    where.city = {
      contains: city as string,
      mode: 'insensitive'
    };
  }

  if (pincode) {
    where.pincode = pincode as string;
  }

  // Build order by clause
  const orderBy: any = {};
  if (sortBy === 'rating') {
    orderBy.rating = sortOrder;
  } else if (sortBy === 'name') {
    orderBy.name = sortOrder;
  } else if (sortBy === 'createdAt') {
    orderBy.createdAt = sortOrder;
  }

  const stores = await prisma.store.findMany({
    where,
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          products: true,
        }
      }
    },
    orderBy,
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.store.count({ where });

  logger.info('Stores retrieved successfully', {
    count: stores.length,
    total,
    filters: { category, city, pincode }
  });

  res.status(200).json({
    success: true,
    message: 'Stores retrieved successfully',
    data: {
      stores,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      }
    }
  });
});

// Get store by ID
export const getStoreById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const store = await prisma.store.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          products: true,
        }
      }
    }
  });

  if (!store) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'STORE_NOT_FOUND',
        message: 'Store not found',
      }
    });
  }

  logger.info('Store retrieved successfully', { storeId: id });

  res.status(200).json({
    success: true,
    message: 'Store retrieved successfully',
    data: { store }
  });
});

// Get store products
export const getStoreProducts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    category, 
    limit = '20', 
    offset = '0',
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Verify store exists and is active
  const store = await prisma.store.findFirst({
    where: {
      id,
      isActive: true,
    }
  });

  if (!store) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'STORE_NOT_FOUND',
        message: 'Store not found',
      }
    });
  }

  // Build where clause for products
  const where: any = {
    storeId: id,
    isAvailable: true,
  };

  if (category) {
    where.category = category;
  }

  // Build order by clause
  const orderBy: any = {};
  if (sortBy === 'name') {
    orderBy.name = sortOrder;
  } else if (sortBy === 'price') {
    orderBy.price = sortOrder;
  } else if (sortBy === 'createdAt') {
    orderBy.createdAt = sortOrder;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.product.count({ where });

  logger.info('Store products retrieved successfully', {
    storeId: id,
    count: products.length,
    total
  });

  res.status(200).json({
    success: true,
    message: 'Store products retrieved successfully',
    data: {
      products,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      }
    }
  });
});

// Search stores
export const searchStores = asyncHandler(async (req: Request, res: Response) => {
  const { 
    q, 
    category, 
    city, 
    limit = '20', 
    offset = '0' 
  } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_QUERY',
        message: 'Search query is required',
      }
    });
  }

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Build where clause
  const where: any = {
    isActive: true,
    OR: [
      {
        name: {
          contains: q as string,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: q as string,
          mode: 'insensitive'
        }
      }
    ]
  };

  if (category && Object.values(StoreCategory).includes(category as StoreCategory)) {
    where.category = category;
  }

  if (city) {
    where.city = {
      contains: city as string,
      mode: 'insensitive'
    };
  }

  const stores = await prisma.store.findMany({
    where,
    include: {
      merchant: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      _count: {
        select: {
          products: true,
        }
      }
    },
    orderBy: {
      rating: 'desc'
    },
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.store.count({ where });

  logger.info('Store search completed', {
    query: q,
    count: stores.length,
    total
  });

  res.status(200).json({
    success: true,
    message: 'Store search completed successfully',
    data: {
      stores,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total,
      }
    }
  });
});

// Get store categories
export const getStoreCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = Object.values(StoreCategory).map(category => ({
    value: category,
    label: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' '),
  }));

  logger.info('Store categories retrieved successfully');

  res.status(200).json({
    success: true,
    message: 'Store categories retrieved successfully',
    data: { categories }
  });
});
