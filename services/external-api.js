const axios = require('axios')

const FAKE_STORE_API = 'https://fakestoreapi.com'

const externalAPI = {
    getExternalProducts: async () => {
        try {
            const response = await axios.get(`${FAKE_STORE_API}/products`)
            return response.data.map(product => ({
                product_name: product.title,
                description: product.description.substring(0, 100),
                price: Math.round(product.price * 15000), // Convert USD to IDR
                stock: 50 // Default stock
            }))
        } catch (error) {
            throw new Error('Failed to fetch external products')
        }
    },

    getProductsByCategory: async (category) => {
        try {
            const response = await axios.get(`${FAKE_STORE_API}/products/category/${category}`)
            return response.data.map(product => ({
                product_name: product.title,
                description: product.description.substring(0, 100),
                price: Math.round(product.price * 15000),
                stock: 50
            }))
        } catch (error) {
            throw new Error('Failed to fetch products by category')
        }
    },

    getCategories: async () => {
        try {
            const response = await axios.get(`${FAKE_STORE_API}/products/categories`)
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch categories')
        }
    }
}

module.exports = externalAPI