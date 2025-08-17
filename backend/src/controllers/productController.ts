import { Request, Response } from 'express';
import { PrismaClient, ProductCategory } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Get all available products with optional filtering
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    category, 
    storeId, 
    minPrice, 
    maxPrice, 
    limit = '20', 
    offset = '0',
    sortBy = 'name',
    sortOrder = 'asc'
  } = req.query;

  const limitNum = parseInt(limit as string);
  const offsetNum = parseInt(offset as string);

  // Build where clause
  const where: any = {
    isAvailable: true,
  };

  if (category && Object.values(ProductCategory).includes(category as ProductCategory)) {
    where.category = category;
  }

  if (storeId) {
    where.storeId = storeId;
  }

  if (minPrice) {
    where.price = {
      ...where.price,
      gte: parseFloat(minPrice as string)
    };
  }

  if (maxPrice) {
    where.price = {
      ...where.price,
      lte: parseFloat(maxPrice as string)
    };
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
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
          deliveryFee: true,
          estimatedDeliveryTime: true,
        }
      }
    },
    orderBy,
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.product.count({ where });

  logger.info('Products retrieved successfully', {
    count: products.length,
    total,
    filters: { category, storeId, minPrice, maxPrice }
  });

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
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

// Get product by ID
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      id,
      isAvailable: true,
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
          deliveryFee: true,
          estimatedDeliveryTime: true,
          address: true,
          city: true,
        }
      }
    }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found',
      }
    });
  }

  logger.info('Product retrieved successfully', { productId: id });

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: { product }
  });
});

// Search products
export const searchProducts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    q, 
    category, 
    storeId, 
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
    isAvailable: true,
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

  if (category && Object.values(ProductCategory).includes(category as ProductCategory)) {
    where.category = category;
  }

  if (storeId) {
    where.storeId = storeId;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
          deliveryFee: true,
          estimatedDeliveryTime: true,
        }
      }
    },
    orderBy: {
      name: 'asc'
    },
    take: limitNum,
    skip: offsetNum,
  });

  const total = await prisma.product.count({ where });

  logger.info('Product search completed', {
    query: q,
    count: products.length,
    total
  });

  res.status(200).json({
    success: true,
    message: 'Product search completed successfully',
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

// Get product categories
export const getProductCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = Object.values(ProductCategory).map(category => ({
    value: category,
    label: category.charAt(0) + category.slice(1).toLowerCase().replace('_', ' '),
  }));

  logger.info('Product categories retrieved successfully');

  res.status(200).json({
    success: true,
    message: 'Product categories retrieved successfully',
    data: { categories }
  });
});

// Get featured products
export const getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  const limitNum = parseInt(limit as string);

  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      isFeatured: true,
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
          deliveryFee: true,
          estimatedDeliveryTime: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limitNum,
  });

  logger.info('Featured products retrieved successfully', {
    count: products.length
  });

  res.status(200).json({
    success: true,
    message: 'Featured products retrieved successfully',
    data: { products }
  });
});
