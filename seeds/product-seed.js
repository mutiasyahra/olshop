const db = require('../config/db')

const products = [
    {
        product_name: 'Aloe Vera Face Mask',
        description: 'Aloe vera-based face mask to hydrate and nourish your skin.',
        price: 20000,
        stock: 100
    },
    {
        product_name: 'Korean Style Lip Tint',
        description: 'Long-lasting lip tint with a natural finish and lightweight texture.',
        price: 35000,
        stock: 80
    },
    {
        product_name: 'Unisex Plain T-Shirt',
        description: 'Premium cotton plain t-shirt, comfortable for everyday wear.',
        price: 50000,
        stock: 120
    },
    {
        product_name: 'Transparent Phone Softcase',
        description: 'Silicone transparent softcase to protect your phone from scratches.',
        price: 15000,
        stock: 200
    },
    {
        product_name: 'Mini Bluetooth Headset',
        description: 'Compact Bluetooth headset with crystal clear sound and long battery life.',
        price: 75000,
        stock: 50
    },
    {
        product_name: 'USB LED Light',
        description: 'Portable LED light that plugs into any USB port, energy-saving.',
        price: 25000,
        stock: 100
    },
    {
        product_name: 'Casual Sling Bag',
        description: 'Modern design sling bag, perfect for daily activities.',
        price: 60000,
        stock: 70
    },
    {
        product_name: 'Diamond Pashmina Hijab',
        description: 'Non-slip diamond-texture hijab, easy to style and lightweight.',
        price: 40000,
        stock: 90
    },
    {
        product_name: '1L Water Bottle',
        description: 'Large capacity water bottle, ideal for outdoor activities.',
        price: 30000,
        stock: 150
    },
    {
        product_name: 'Travel Neck Pillow',
        description: 'Soft neck pillow for maximum comfort during travel.',
        price: 45000,
        stock: 60
    }
]

const seedProducts = async () => {
    try {
        for (const product of products) {
            await db.query(
                'INSERT INTO products (product_name, description, price, stock) VALUES (?, ?, ?, ?)',
                [product.product_name, product.description, product.price, product.stock]
            )
        }
        console.log('Products seeded successfully!')
        process.exit(0)
    } catch (error) {
        console.error('Error seeding products:', error)
        process.exit(1)
    }
}

seedProducts()