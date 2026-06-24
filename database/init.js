/**
 * Database initializer — reads schema.sql and executes it.
 * Run: npm run db:init
 */
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function init() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  console.log('⚙️  Running schema…');
  await conn.query(sql);
  console.log('✅  Database "socialnet" initialized successfully.');
  await conn.end();
}

init().catch(err => { console.error('❌  DB init failed:', err.message); process.exit(1); });
