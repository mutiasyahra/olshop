const express = require('express')
const router = express.Router()
const olshopController = require('../controllers/olshop-controller')
const { authMiddleware } = require('../middlewares/auth-middleware')

// Public endpoints
router.post('/register', olshopController.register)
router.post('/login', olshopController.login)
router.get('/products', olshopController.getAllProducts)
router.get('/products/:id', olshopController.getProductById)
router.get('/products/search', olshopController.searchProducts)

// Customer protected endpoints
router.get('/profile', authMiddleware, olshopController.getProfile)
router.put('/profile', authMiddleware, olshopController.updateProfile)
router.get('/orders', authMiddleware, olshopController.getCustomerOrders)
router.post('/orders', authMiddleware, olshopController.createOrder)
router.get('/orders/:id', authMiddleware, olshopController.getOrderDetails)
router.post('/orders/:id/cancel', authMiddleware, olshopController.cancelOrder)

// Payment endpoints
router.post('/payments', authMiddleware, olshopController.createPayment)
router.get('/payments/:id', authMiddleware, olshopController.getPaymentDetails)
router.put('/payments/:id/status', authMiddleware, olshopController.updatePaymentStatus)

// Admin endpoints
router.post('/products', authMiddleware, olshopController.createProduct)
router.put('/products/:id', authMiddleware, olshopController.updateProduct)
router.delete('/products/:id', authMiddleware, olshopController.deleteProduct)
router.get('/admin/customers', authMiddleware, olshopController.getAllCustomers)
router.get('/admin/orders', authMiddleware, olshopController.getAllOrders)
router.put('/admin/orders/:id/status', authMiddleware, olshopController.updateOrderStatus)

module.exports = router