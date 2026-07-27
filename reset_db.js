const mysql = require('mysql2/promise');
require('dotenv').config();

const data = [
  { category: 'Vegetables', image: '/category-icons/veggies.png', products: [
    { name: 'Pumpkin', quantity: '500 grams', currentPrice: 25, cutPrice: 200, rating: 4.4, image: '/products/pumpkin.png' },
    { name: 'Green chilli (Grade - A)', quantity: '100 grams', currentPrice: 15, cutPrice: 200, rating: 4.7, image: '/products/chilli.png' },
    { name: 'Garlic', quantity: '250 grams', currentPrice: 50, cutPrice: 200, rating: 4.1, image: '/products/garlic.png' },
    { name: 'Cucumber', quantity: '1 kg', currentPrice: 80, cutPrice: 200, rating: 4.4, image: '/products/cucumber.png' },
    { name: 'Carrot', quantity: '500 grams', currentPrice: 30, cutPrice: 200, rating: 4.9, image: '/products/carrot.png' },
    { name: 'Lau', quantity: '500 grams', currentPrice: 30, cutPrice: 200, rating: 4.3, image: '/products/lau.png' },
    { name: 'Potato', quantity: '1 kg', currentPrice: 20, cutPrice: 200, rating: 4.5, image: '/products/potato.png' },
    { name: 'Ginger', quantity: '250 grams', currentPrice: 35, cutPrice: 200, rating: 4.6, image: '/products/ginger.png' },
    { name: 'Beans', quantity: '100 grams', currentPrice: 15, cutPrice: 200, rating: 4.2, image: '/products/beans.png' },
    { name: 'Tomato', quantity: '1 kg', currentPrice: 50, cutPrice: 200, rating: 4.8, image: '/products/tomato.png' },
    { name: 'Green Pepe', quantity: '1 kg', currentPrice: 35, cutPrice: 200, rating: 4.3, image: '/products/papaya.png' },
    { name: 'Kalmi Saag', quantity: '1 bunch', currentPrice: 10, cutPrice: 200, rating: 4.7, image: '/products/kalmi.png' },
    { name: 'Dhaniya Pata', quantity: '100 grams', currentPrice: 20, cutPrice: 200, rating: 4.9, image: '/products/dhaniya.png' },
    { name: 'Begun', quantity: '500 grams', currentPrice: 35, cutPrice: 200, rating: 4.5, image: '/products/begun.png' },
    { name: 'Corola', quantity: '1 kg', currentPrice: 55, cutPrice: 200, rating: 4.2, image: '/products/corola.png' },
    { name: 'Lady Finger', quantity: '1 kg', currentPrice: 55, cutPrice: 200, rating: 4.4, image: '/products/ladyfinger.png' },
    { name: 'Potol', quantity: '500 grams', currentPrice: 30, cutPrice: 200, rating: 4.3, image: '/products/parwal.png' },
    { name: 'Onion', quantity: '1 kg', currentPrice: 35, cutPrice: 200, rating: 4.6, image: '/products/onion.png' }
  ]},
  { category: 'Fruits', image: '/category-icons/fruits.png', products: [
    { name: 'Lucknow Mango', quantity: '1 kg', currentPrice: 50, cutPrice: 200, rating: 4.8, image: '/products/mango.png' },
    { name: 'Watermelon', quantity: '1 kg', currentPrice: 50, cutPrice: 200, rating: 4.5, image: '/products/watermelon.png' },
    { name: 'Premium Kashmiri Apple', quantity: '1 kg', currentPrice: 320, cutPrice: 400, rating: 4.9, image: '/products/apple.png' }
  ]},
  { category: 'Grocery', image: '/category-icons/grocery.png', products: [
    { name: 'Rice', quantity: '1 kg', currentPrice: 100, cutPrice: 200, rating: 4.5, image: '/products/rice.png' },
    { name: 'Wheat', quantity: '1 kg', currentPrice: 100, cutPrice: 200, rating: 4.5, image: '/products/wheat.png' },
    { name: 'Bread', quantity: '500 grams', currentPrice: 50, cutPrice: 200, rating: 4.5, image: '/products/bread.png' }
  ]},
  { category: 'Milk products', image: '/category-icons/milk.png', products: [
    { name: 'Pure Cow Milk', quantity: '500 ml', currentPrice: 30, cutPrice: 200, rating: 4.5, image: '/products/milk.png' },
    { name: 'Ghee', quantity: '1 kg', currentPrice: 120, cutPrice: 200, rating: 4.5, image: '/products/ghee.png' },
    { name: 'Butter', quantity: '500 grams', currentPrice: 60, cutPrice: 200, rating: 4.5, image: '/products/butter.png' },
    { name: 'Paneer', quantity: '1 kg', currentPrice: 100, cutPrice: 200, rating: 4.5, image: '/products/paneer.png' }
  ]},
  { category: 'Meat', image: '/category-icons/meat.png', products: [
    { name: 'Whole Chicken', quantity: '1 kg', currentPrice: 200, cutPrice: 200, rating: 4.5, image: '/products/whole_chicken.png' },
    { name: 'Cut Chicken', quantity: '1 kg', currentPrice: 250, cutPrice: 200, rating: 4.5, image: '/products/cut_chicken.png' },
    { name: 'Whole Mutton', quantity: '1 kg', currentPrice: 800, cutPrice: 200, rating: 4.5, image: '/products/mutton.png' },
    { name: 'Cut Mutton', quantity: '1 kg', currentPrice: 1000, cutPrice: 200, rating: 4.5, image: '/products/cut_mutton.png' }
  ]},
  { category: 'Fish', image: '/category-icons/fish.png', products: [
    { name: 'Rohu', quantity: '1 kg', currentPrice: 200, cutPrice: 200, rating: 4.5, image: '/products/rohu.png' },
    { name: 'Katla', quantity: '1 kg', currentPrice: 250, cutPrice: 200, rating: 4.5, image: '/products/katla.png' },
    { name: 'Chingri', quantity: '1 kg', currentPrice: 800, cutPrice: 200, rating: 4.5, image: '/products/chingri.png' },
    { name: 'Elish', quantity: '1 kg', currentPrice: 1000, cutPrice: 200, rating: 4.5, image: '/products/elish.png' }
  ]},
  { category: 'Eggs', image: '/category-icons/eggs.png', products: [
    { name: 'Chicken Eggs', quantity: '12 pcs', currentPrice: 70, cutPrice: 200, rating: 4.5, image: '/products/chicken_eggs.png' },
    { name: 'Duck Eggs', quantity: '12 pcs', currentPrice: 100, cutPrice: 200, rating: 4.5, image: '/products/duck_eggs.png' }
  ]},
  { category: 'Flowers', image: '/category-icons/flowers.png', products: [
    { name: 'Genda phool', quantity: '1 pc mala', currentPrice: 30, cutPrice: 200, rating: 4.5, image: '/products/genda_phool.png' }
  ]}
];

async function seed() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'taja_cart'
    });

    console.log('Connected. Starting reset...');
    await connection.query(`DROP TABLE IF EXISTS products`);
    await connection.query(`DROP TABLE IF EXISTS categories`);
    
    await connection.query(`CREATE TABLE categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE,
      image TEXT
    )`);
    
    await connection.query(`CREATE TABLE products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT,
      name TEXT,
      quantity TEXT,
      currentPrice REAL,
      cutPrice REAL,
      rating REAL,
      image TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`);

    for (const cat of data) {
      const [result] = await connection.query(
        `INSERT IGNORE INTO categories (name, image) VALUES (?, ?)`, 
        [cat.category, cat.image]
      );
      
      let catId = result.insertId;
      // If IGNORE bypassed it, find it
      if (!catId) {
        const [rows] = await connection.query(`SELECT id FROM categories WHERE name = ?`, [cat.category]);
        if (rows.length > 0) catId = rows[0].id;
      }
      
      for (const prod of cat.products) {
        await connection.query(
          `INSERT INTO products (category_id, name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [catId, prod.name, prod.quantity, prod.currentPrice, prod.cutPrice, prod.rating, prod.image]
        );
      }
    }

    console.log('Database seeded successfully.');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

seed();
