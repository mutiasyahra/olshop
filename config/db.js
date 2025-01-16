require('dotenv').config()
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DB_NAME
})

const poolPromise = pool.promise()
module.exports = poolPromise