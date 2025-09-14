import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

let pool;
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.MYSQL_URL || 'mysql://root:password@localhost:3306/unimegle',
      connectionLimit: 10,
      waitForConnections: true,
    })
  }
  return pool
}

export async function query(sql, params) {
  const [rows] = await getPool().execute(sql, params)
  return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 }
}



