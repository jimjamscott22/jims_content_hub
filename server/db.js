import mysql from 'mysql2/promise'

const DB_HOST = process.env.DB_HOST || '127.0.0.1'
const DB_PORT = Number(process.env.DB_PORT || 3306)
const DB_NAME = process.env.DB_NAME || 'jims_content_hub'
const DB_USER = process.env.DB_USER || 'root'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_POOL_SIZE = Number(process.env.DB_POOL_SIZE || 5)
const DB_MAX_OVERFLOW = Number(process.env.DB_MAX_OVERFLOW || 0)

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  // mysql2 has no overflow setting, so we map to a larger connection limit.
  connectionLimit: DB_POOL_SIZE + DB_MAX_OVERFLOW,
  queueLimit: 0,
})

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params)
  return rows
}

async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params)
  return result
}

async function withTransaction(work) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const tx = {
      async query(sql, params = []) {
        const [rows] = await connection.query(sql, params)
        return rows
      },
      async queryOne(sql, params = []) {
        const [rows] = await connection.query(sql, params)
        return rows[0] || null
      },
      async execute(sql, params = []) {
        const [result] = await connection.execute(sql, params)
        return result
      },
    }

    const result = await work(tx)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url TEXT NOT NULL,
      title VARCHAR(512) NOT NULL,
      description TEXT,
      category_id INT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      is_favorite TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_bookmarks_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `)

  await query(`
    CREATE TABLE IF NOT EXISTS bookmark_tags (
      bookmark_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (bookmark_id, tag_id),
      CONSTRAINT fk_bookmark_tags_bookmark
        FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_bookmark_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB
  `)
}

await initializeDatabase()

const db = {
  query,
  queryOne,
  execute,
  withTransaction,
  pool,
}

export default db
