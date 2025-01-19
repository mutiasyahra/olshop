const express = require('express')
const router = express.Router()
const olshopController = require('../controllers/olshop-controller')
const authMiddleware = require('../middlewares/auth-middleware')

// Public endpoints
router.post('/register', olshopController.register)
router.post('/login', olshopController.login)

// Product endpoints (public)
router.get('/products/search', olshopController.searchProducts)
router.get('/products', olshopController.getAllProducts)
router.get('/products/:id', olshopController.getProductById)

// Customer profile endpoints (protected)
router.get('/profile', authMiddleware, olshopController.getProfile)
router.put('/profile', authMiddleware, olshopController.updateProfile)

// Order endpoints (protected)
router.get('/orders', authMiddleware, olshopController.getCustomerOrders)
router.post('/orders', authMiddleware, olshopController.createOrder)
router.get('/orders/:id', authMiddleware, olshopController.getOrderDetails)
router.post('/orders/:id/cancel', authMiddleware, olshopController.cancelOrder)


// Payment endpoints (protected)
router.post('/payments', authMiddleware, olshopController.createPayment)
router.get('/payments/:id', authMiddleware, olshopController.getPaymentDetails)

// Admin endpoints (protected)
router.post('/admin/products', authMiddleware, olshopController.createProduct)
router.put('/admin/products/:id', authMiddleware, olshopController.updateProduct)
router.delete('/admin/products/:id', authMiddleware, olshopController.deleteProduct)
router.get('/admin/customers', authMiddleware, olshopController.getAllCustomers)
router.get('/admin/orders', authMiddleware, olshopController.getAllOrders)
router.put('/admin/orders/:id/status', authMiddleware, olshopController.updateOrderStatus)
router.put('/admin/payments/:id/status', authMiddleware, olshopController.updatePaymentStatus)
router.post('/admin/products/sync', authMiddleware, olshopController.syncExternalProducts)

module.exports = router