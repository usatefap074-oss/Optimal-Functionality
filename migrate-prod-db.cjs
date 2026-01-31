const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'parrot_shop.db');
const db = new Database(dbPath);

console.log('Checking products table schema...');
const tableInfo = db.prepare('PRAGMA table_info(products)').all();
console.log('Current columns:', tableInfo.map(c => c.name).join(', '));

const hasCategory = tableInfo.some(col => col.name === 'category');

if (hasCategory) {
  console.log('Removing category column...');
  
  db.exec('BEGIN TRANSACTION');
  db.exec('CREATE TABLE products_new (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, price INTEGER NOT NULL, old_price INTEGER, in_stock INTEGER DEFAULT 1 NOT NULL, image TEXT NOT NULL, images TEXT NOT NULL, description TEXT NOT NULL, specs TEXT NOT NULL, popular INTEGER DEFAULT 0, created_at INTEGER)');
  db.exec('INSERT INTO products_new (id, slug, name, price, old_price, in_stock, image, images, description, specs, popular, created_at) SELECT id, slug, name, price, old_price, in_stock, image, images, description, specs, popular, created_at FROM products');
  db.exec('DROP TABLE products');
  db.exec('ALTER TABLE products_new RENAME TO products');
  db.exec('COMMIT');
  
  console.log('Migration complete!');
} else {
  console.log('No migration needed.');
}

db.close();
