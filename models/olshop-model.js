const db = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const externalAPI = require('../services/external-api')
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
        try {
            // Validasi input
            if (!data.email || !data.password) {
                throw new Error('Email and password are required')
            }

            // Cek email user
            const [users] = await db.query('SELECT * FROM customers WHERE email = ?', [data.email])
            const user = users[0]
            
            // Jika user tidak ditemukan
            if (!user) {
                throw new Error('Invalid email or password')
            }

            // Verifikasi password
            const isValid = await bcrypt.compare(data.password, user.password)
            if (!isValid) {
                throw new Error('Invalid email or password')
            }

            // Generate token
            const token = jwt.sign({
                id: user.customer_id,
                email: user.email
            }, SECRET_KEY, {expiresIn: "24h"})
            
            // Return user data dan token
            return {
                token,
                user: {
                    customer_id: user.customer_id,
                    name: user.name,
                    email: user.email
                }
            }
        } catch (error) {
            throw error
        }
    },

    getCustomerById: async (id) => {
        const [customer] = await db.query(
            'SELECT customer_id, name, email, phone, address FROM customers WHERE customer_id = ?',
            [id]
        )
        return customer[0]
    },

    updateCustomer: async (id, data) => {
        const {name, phone, address} = data
        const [result] = await db.query(
            'UPDATE customers SET name = ?, phone = ?, address = ? WHERE customer_id = ?',
            [name, phone, address, id]
        )
        return result.affectedRows > 0 ? 
            { message: 'Profile updated successfully' } : 
            { message: 'No changes made' }
    },

    getAllCustomers: async () => {
        const [customers] = await db.query(
            'SELECT customer_id, name, email, phone, address FROM customers'
        )
        return customers
    },

    // Product operations
    createProduct: async (data) => {
        const {product_name, description, price, stock} = data
        const [result] = await db.query(
            'INSERT INTO products (product_name, description, price, stock) VALUES (?, ?, ?, ?)',
            [product_name, description, price, stock]
        )
        return {
            product_id: result.insertId,
            product_name,
            description,
            price,
            stock
        }
    },

    getAllProducts: async () => {
        const [products] = await db.query('SELECT * FROM products WHERE stock > 0')
        return products
    },

    getProductById: async (id) => {
        const [product] = await db.query('SELECT * FROM products WHERE product_id = ?', [id])
        return product[0]
    },

    updateProduct: async (id, data) => {
        const {product_name, description, price, stock} = data
        const [result] = await db.query(
            'UPDATE products SET product_name = ?, description = ?, price = ?, stock = ? WHERE product_id = ?',
            [product_name, description, price, stock, id]
        )
        return result.affectedRows > 0 ? 
            { message: 'Product updated successfully' } : 
            { message: 'Product not found' }
    },

    deleteProduct: async (id) => {
        const [result] = await db.query('DELETE FROM products WHERE product_id = ?', [id])
        return result.affectedRows > 0 ? 
            { message: 'Product deleted successfully' } : 
            { message: 'Product not found' }
    },

    searchProducts: async (query) => {
        const [products] = await db.query(
            `SELECT * FROM products 
            WHERE (product_name LIKE ? OR description LIKE ?) 
            AND stock > 0`,
            [`%${query}%`, `%${query}%`]
        )
        return products
    },

    // Order operations
    createOrder: async (data) => {
        const {customer_id, product_id, payment_method, total_amount} = data
        
        const connection = await db.getConnection()
        await connection.beginTransaction()
    
        try {
            // 1. Verify product availability and stock
            const [product] = await connection.query(
                'SELECT * FROM products WHERE product_id = ? AND stock > 0',
                [product_id]
            )
            
            if (!product[0]) {
                throw new Error('Product not available')
            }
    
            // 2. Create order first
            const [order] = await connection.query(
                'INSERT INTO order_products (customer_id, product_id, order_date, total_amount, status) VALUES (?, ?, NOW(), ?, "Pending")',
                [customer_id, product_id, total_amount]
            )
    
            // 3. Create payment with order_id
            const [payment] = await connection.query(
                'INSERT INTO payments (order_id, payment_date, payment_method, payment_status, amount_paid) VALUES (?, NOW(), ?, "Pending", ?)',
                [order.insertId, payment_method, total_amount]
            )
    
            // 4. Update order with payment_id
            await connection.query(
                'UPDATE order_products SET payment_id = ? WHERE order_id = ?',
                [payment.insertId, order.insertId]
            )
    
            // 5. Update product stock
            await connection.query(
                'UPDATE products SET stock = stock - 1 WHERE product_id = ?',
                [product_id]
            )
    
            await connection.commit()
            return {
                order_id: order.insertId,
                payment_id: payment.insertId,
                status: 'Pending'
            }
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },

    getOrderById: async (id) => {
        const [order] = await db.query(
            `SELECT op.*, p.product_name, p.price, c.name as customer_name, pay.payment_status 
            FROM order_products op 
            JOIN products p ON op.product_id = p.product_id 
            JOIN customers c ON op.customer_id = c.customer_id 
            JOIN payments pay ON op.payment_id = pay.payment_id 
            WHERE op.order_id = ?`,
            [id]
        )
        return order[0]
    },

    getCustomerOrders: async (customerId) => {
        const [orders] = await db.query(
            `SELECT op.*, p.product_name, pay.payment_status 
            FROM order_products op 
            JOIN products p ON op.product_id = p.product_id 
            JOIN payments pay ON op.payment_id = pay.payment_id 
            WHERE op.customer_id = ?
            ORDER BY op.order_date DESC`,
            [customerId]
        )
        return orders
    },

    getAllOrders: async () => {
        const [orders] = await db.query(
            `SELECT op.*, p.product_name, c.name as customer_name, pay.payment_status 
            FROM order_products op 
            JOIN products p ON op.product_id = p.product_id 
            JOIN customers c ON op.customer_id = c.customer_id 
            JOIN payments pay ON op.payment_id = pay.payment_id
            ORDER BY op.order_date DESC`
        )
        return orders
    },

    updateOrderStatus: async (id, status) => {
        const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled']
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status')
        }

        const [result] = await db.query(
            'UPDATE order_products SET status = ? WHERE order_id = ?',
            [status, id]
        )
        return result.affectedRows > 0 ? 
            { message: 'Order status updated successfully' } : 
            { message: 'Order not found' }
    },

    // Payment operations
    createPayment: async (data) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();
    
        try {
            const { order_id, payment_method, amount_paid } = data;
        
            // Verify order exists and hasn't been paid
            const [orders] = await connection.query(
                `SELECT op.*, p.payment_status 
                FROM order_products op
                LEFT JOIN payments p ON op.payment_id = p.payment_id
                WHERE op.order_id = ?`,
                [order_id]
            );
        
            const order = orders[0];
            if (!order) {
                throw new Error('Order not found');
            }
        
            if (order.payment_status === 'Paid') {
                throw new Error('Order has already been paid');
            }

            // Create payment record
            const [payment] = await connection.query(
                'INSERT INTO payments (order_id, payment_date, payment_method, payment_status, amount_paid) VALUES (?, NOW(), ?, "Pending", ?)',
                [order_id, payment_method, amount_paid]
            );

            // Update order with payment_id
            await connection.query(
                'UPDATE order_products SET payment_id = ? WHERE order_id = ?',
                [payment.insertId, order_id]
            );

            await connection.commit();
            return {
                payment_id: payment.insertId,
                order_id,
                payment_method,
                amount_paid,
                payment_status: 'Paid'
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getPaymentById: async (id) => {
        const [payment] = await db.query(
            `SELECT p.*, op.order_id, op.status as order_status
            FROM payments p
            JOIN order_products op ON p.order_id = op.order_id
            WHERE p.payment_id = ?`,
            [id]
        )
        return payment[0]
    },

    updatePaymentStatus: async (id, status) => {
        const validStatuses = ['Pending', 'Paid', 'Failed']
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid payment status')
        }

        const [result] = await db.query(
            'UPDATE payments SET payment_status = ? WHERE payment_id = ?',
            [status, id]
        )
        return result.affectedRows > 0 ? 
            { message: 'Payment status updated successfully' } : 
            { message: 'Payment not found' }
    },

    // External API integration
    syncExternalProducts: async () => {
        const connection = await db.getConnection()
        await connection.beginTransaction()

        try {
            const externalProducts = await externalAPI.getExternalProducts()
            
            for (const product of externalProducts) {
                await connection.query(
                    `INSERT INTO products 
                    (product_name, description, price, stock) 
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    description = VALUES(description),
                    price = VALUES(price),
                    stock = VALUES(stock)`,
                    [
                        product.product_name,
                        product.description,
                        product.price,
                        product.stock
                    ]
                )
            }

            await connection.commit()
            return { message: 'Products synchronized successfully', count: externalProducts.length }
        } catch (error) {
            await connection.rollback()
            throw new Error('Failed to sync external products: ' + error.message)
        } finally {
            connection.release()
        }
    }
}

module.exports = olshopModel