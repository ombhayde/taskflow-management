const mysql = require("mysql2/promise")

let connection

const connectMySQL = async () => {
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    })

    console.log("MySQL Connected successfully")

    await createUsersTable()
  } catch (error) {
    console.error("MySQL connection failed:", error.message)
    throw error
  }
}

const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      passwordHash VARCHAR(255) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    )
  `

  try {
    await connection.execute(createTableQuery)
    console.log("Users table ready")
  } catch (error) {
    console.error("Error creating users table:", error.message)
    throw error
  }
}

const getConnection = () => {
  if (!connection) {
    throw new Error("MySQL connection not established")
  }
  return connection
}

module.exports = { connectMySQL, getConnection }
