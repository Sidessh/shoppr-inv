import { Router } from 'express';
import { authenticate, requireCustomer } from '../middleware/auth.js';
import {
  getStores,
  getStoreById,
  getStoreProducts,
  searchStores,
  getStoreCategories,
} from '../controllers/storeController.js';
import {
  getProducts,
  getProductById,
  searchProducts,
  getProductCategories,
  getFeaturedProducts,
} from '../controllers/productController.js';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  rateOrder,
} from '../controllers/orderController.js';
import {
  createMultiStopOrder,
  getCustomerMultiStopOrders,
  getMultiStopOrderById,
  updateMultiStopOrder,
  deleteMultiStopOrder,
  submitMultiStopOrder,
} from '../controllers/multiStopOrderController.js';
import {
  createConciergeRequest,
  getCustomerConciergeRequests,
  getConciergeRequestById,
  cancelConciergeRequest,
  rateConciergeRequest,
} from '../controllers/conciergeController.js';
import { customerRateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireCustomer);

// Store routes
router.get('/stores', customerRateLimit, getStores);
router.get('/stores/search', customerRateLimit, searchStores);
router.get('/stores/categories', customerRateLimit, getStoreCategories);
router.get('/stores/:id', customerRateLimit, getStoreById);
router.get('/stores/:id/products', customerRateLimit, getStoreProducts);

// Product routes
router.get('/products', customerRateLimit, getProducts);
router.get('/products/search', customerRateLimit, searchProducts);
router.get('/products/categories', customerRateLimit, getProductCategories);
router.get('/products/featured', customerRateLimit, getFeaturedProducts);
router.get('/products/:id', customerRateLimit, getProductById);

// Order routes
router.post('/orders', customerRateLimit, createOrder);
router.get('/orders', customerRateLimit, getCustomerOrders);
router.get('/orders/:id', customerRateLimit, getOrderById);
router.patch('/orders/:id/cancel', customerRateLimit, cancelOrder);
router.post('/orders/:id/rate', customerRateLimit, rateOrder);

// Multi-stop order routes
router.post('/multi-stop-orders', customerRateLimit, createMultiStopOrder);
router.get('/multi-stop-orders', customerRateLimit, getCustomerMultiStopOrders);
router.get('/multi-stop-orders/:id', customerRateLimit, getMultiStopOrderById);
router.put('/multi-stop-orders/:id', customerRateLimit, updateMultiStopOrder);
router.delete('/multi-stop-orders/:id', customerRateLimit, deleteMultiStopOrder);
router.patch('/multi-stop-orders/:id/submit', customerRateLimit, submitMultiStopOrder);

// Concierge routes
router.post('/concierge-requests', customerRateLimit, createConciergeRequest);
router.get('/concierge-requests', customerRateLimit, getCustomerConciergeRequests);
router.get('/concierge-requests/:id', customerRateLimit, getConciergeRequestById);
router.patch('/concierge-requests/:id/cancel', customerRateLimit, cancelConciergeRequest);
router.post('/concierge-requests/:id/rate', customerRateLimit, rateConciergeRequest);

export default router;
