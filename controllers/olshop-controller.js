const olshopModel = require('../models/olshop-model')

const olshopController = {
    // Authentication endpoints
    register: async (req, res) => {
        try {
            const result = await olshopModel.registerCustomer(req.body)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    login: async (req, res) => {
        try {
            // Validasi input di level controller
            if (!req.body.email || !req.body.password) {
                return res.status(400).json({ 
                    error: 'Email and password are required' 
                })
            }

            const result = await olshopModel.loginCustomer(req.body)
            res.json({
                status: 'success',
                data: result
            })
        } catch (error) {
            res.status(401).json({ 
                status: 'error',
                error: error.message 
            })
        }
    },
    
    // Customer profile endpoints
    getProfile: async (req, res) => {
        try {
            const profile = await olshopModel.getCustomerById(req.user.id)
            if (!profile) return res.status(404).json({ error: 'Profile not found' })
            res.json(profile)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    updateProfile: async (req, res) => {
        try {
            const result = await olshopModel.updateCustomer(req.user.id, req.body)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // Product endpoints
    getAllProducts: async (req, res) => {
        try {
            const products = await olshopModel.getAllProducts()
            res.json(products)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    getProductById: async (req, res) => {
        try {
            const product = await olshopModel.getProductById(req.params.id)
            if (!product) return res.status(404).json({ error: 'Product not found' })
            res.json(product)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    createProduct: async (req, res) => {
        try {
            const result = await olshopModel.createProduct(req.body)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    updateProduct: async (req, res) => {
        try {
            const result = await olshopModel.updateProduct(req.params.id, req.body)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const result = await olshopModel.deleteProduct(req.params.id)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    searchProducts: async (req, res) => {
        try {
            const { query } = req.query
            const products = await olshopModel.searchProducts(query)
            res.json(products)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // Order endpoints
    createOrder: async (req, res) => {
        try {
            const customer_id = req.user.id  // Dari authMiddleware
            const { product_id, payment_method, total_amount } = req.body

            // Validasi input
            if (!product_id || !payment_method || !total_amount) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields: product_id, payment_method, total_amount'
                })
            }

            // Proses pembuatan order
            const orderData = {
                customer_id,
                product_id,
                payment_method,
                total_amount
            }

            const result = await olshopModel.createOrder(orderData)
            
            res.status(201).json({
                status: 'success',
                data: result
            })

        } catch (error) {
            console.error('Error in createOrder:', error)
            res.status(500).json({
                status: 'error',
                message: error.message || 'Failed to create order'
            })
        }
    },

    getCustomerOrders: async (req, res) => {
        try {
            const orders = await olshopModel.getCustomerOrders(req.user.id)
            res.json(orders)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const order = await olshopModel.getOrderById(req.params.id)
            if (!order) return res.status(404).json({ error: 'Order not found' })
            if (order.customer_id !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            res.json(order)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    cancelOrder: async (req, res) => {
        try {
            const order = await olshopModel.getOrderById(req.params.id)
            if (!order) return res.status(404).json({ error: 'Order not found' })
            if (order.customer_id !== req.user.id) {
                return res.status(403).json({ error: 'Unauthorized' })
            }
            const result = await olshopModel.updateOrderStatus(req.params.id, 'Cancelled')
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // Payment endpoints
    createPayment: async (req, res) => {
        try {
            const { order_id, payment_method, amount_paid } = req.body;
        
            // Validasi input
            if (!order_id || !payment_method || !amount_paid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields: order_id, payment_method, amount_paid'
                });
            }

            const result = await olshopModel.createPayment({
                order_id,
                payment_method,
                amount_paid
            });

            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in createPayment:', error);
            res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create payment'
            });
        }
    },

    getPaymentDetails: async (req, res) => {
        try {
            const payment = await olshopModel.getPaymentById(req.params.id)
            if (!payment) return res.status(404).json({ error: 'Payment not found' })
            res.json(payment)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    updatePaymentStatus: async (req, res) => {
        try {
            const result = await olshopModel.updatePaymentStatus(req.params.id, req.body.status)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // Admin endpoints
    getAllCustomers: async (req, res) => {
        try {
            const customers = await olshopModel.getAllCustomers()
            res.json(customers)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const orders = await olshopModel.getAllOrders()
            res.json(orders)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const result = await olshopModel.updateOrderStatus(req.params.id, req.body.status)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // External API integration
    syncExternalProducts: async (req, res) => {
        try {
            const result = await olshopModel.syncExternalProducts()
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }
}

module.exports = olshopController