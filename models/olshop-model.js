const db = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'olshop-secret-2024'

const olshopModel = {
    // Customer operations
    registerCustomer: async (data) => {
        const {name, email, password, phone, address} = data
        const salt = 10
        const hash = await bcrypt.hash(password, salt)
        const [result] = await db.query(
            'INSERT INTO customers (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)', 
            [name, email, hash, phone, address]
        )
        return {id: result.insertId, email}
    },

    loginCustomer: async (data) => {
        const {email, password} = data
        const [user] = await db.query('SELECT * FROM customers WHERE email = ?', [email])
        if (!user[0]) return null
        
        const isValid = await bcrypt.compare(password, user[0].password)
        if (!isValid) return null

        const token = jwt.sign({
            id: user[0].customer_id,
            email: user[0].email
        }, SECRET_KEY, {expiresIn: "24h"})
        
        return {token, user: {
            customer_id: user[0].customer_id,
            name: user[0].name,
            email: user[0].email
        }}
    },

    // Product operations
    createProduct: async (data) => {
        const {product_name, description, price, stock} = data
        const [result] = await db.query(
            'INSERT INTO products (product_name, description, price, stock) VALUES (?, ?, ?, ?)',
            [product_name, description, price, stock]
        )
        return result
    },

    getAllProducts: async () => {
        const [products] = await db.query('SELECT * FROM products')
        return products
    },

    getProductById: async (id) => {
        const [product] = await db.query('SELECT * FROM products WHERE product_id = ?', [id])
        return product[0]
    },

    // Order operations
    createOrder: async (data) => {
        const {customer_id, product_id, payment_id, total_amount} = data
        const [result] = await db.query(
            'INSERT INTO order_products (customer_id, product_id, payment_id, order_date, total_amount, status) VALUES (?, ?, ?, NOW(), ?, "Pending")',
            [customer_id, product_id, payment_id, total_amount]
        )
        return result
    },

    getCustomerOrders: async (customerId) => {
        const [orders] = await db.query(
            'SELECT op.*, p.product_name, pay.payment_status FROM order_products op ' +
            'JOIN product p ON op.product_id = p.product_id ' +
            'JOIN payment pay ON op.payment_id = pay.payment_id ' +
            'WHERE op.customer_id = ?',
            [customerId]
        )
        return orders
    },

    // Payment operations
    createPayment: async (data) => {
        const {order_id, payment_method, amount_paid} = data
        const [result] = await db.query(
            'INSERT INTO payments (order_id, payment_date, payment_method, payment_status, amount_paid) VALUES (?, NOW(), ?, "Pending", ?)',
            [order_id, payment_method, amount_paid]
        )
        return result
    },

    updatePaymentStatus: async (paymentId, status) => {
        const [result] = await db.query(
            'UPDATE payments SET payment_status = ? WHERE payment_id = ?',
            [status, paymentId]
        )
        return result
    }
}

module.exports = olshopModel