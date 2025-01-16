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
            const result = await olshopModel.loginCustomer(req.body)
            if (!result) return res.status(401).json({ error: 'Invalid credentials' })
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // Public product endpoints
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

    searchProducts: async (req, res) => {
        try {
            const { query } = req.query
            const products = await olshopModel.searchProducts(query)
            res.json(products)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // Customer profile endpoints
    getProfile: async (req, res) => {
        try {
            const profile = await olshopModel.getCustomerById(req.user.id)
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

    // Order endpoints
    getCustomerOrders: async (req, res) => {
        try {
            const orders = await olshopModel.getCustomerOrders(req.user.id)
            res.json(orders)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    createOrder: async (req, res) => {
        try {
            const orderData = { ...req.body, customer_id: req.user.id }
            const result = await olshopModel.createOrder(orderData)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    getOrderDetails: async (req, res) => {
        try {
            const order = await olshopModel.getOrderById(req.params.id)
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
            const result = await olshopModel.createPayment(req.body)
            res.json(result)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    getPaymentDetails: async (req, res) => {
        try {
            const payment = await olshopModel.getPaymentById(req.params.id)
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
    }
}

module.exports = olshopController