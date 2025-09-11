const mysql = require("mysql2/promise")

let pool

const connectMySQL = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "password",
      database: process.env.MYSQL_DATABASE || "task_management",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })

    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()

    console.log(" MySQL Connected successfully")
  } catch (error) {
    console.error(" MySQL connection failed:", error.message)
    throw error
  }
}

const getConnection = async () => {
  if (!pool) {
    throw new Error("MySQL pool not initialized. Call connectMySQL() first.")
  }
  return await pool.getConnection()
}

const getPool = () => {
  if (!pool) {
    throw new Error("MySQL pool not initialized. Call connectMySQL() first.")
  }
  return pool
}

module.exports = connectMySQL
module.exports.connectMySQL = connectMySQL
module.exports.getConnection = getConnection
module.exports.getPool = getPool
