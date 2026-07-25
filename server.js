const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Database Setup
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Customers Table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      email TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      picture TEXT,
      joinedDate TEXT
    )`);

    // Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT,
      items TEXT,
      grandTotal REAL,
      deliveryDetails TEXT,
      userEmail TEXT,
      userPhone TEXT,
      status TEXT,
      rating INTEGER,
      review TEXT,
      FOREIGN KEY (userEmail) REFERENCES customers (email)
    )`);

    // Migrations for existing orders table
    db.run('ALTER TABLE orders ADD COLUMN rating INTEGER', (err) => {});
    db.run('ALTER TABLE orders ADD COLUMN review TEXT', (err) => {});
    db.run('ALTER TABLE orders ADD COLUMN eta TEXT', (err) => {});

    // Categories Table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      image TEXT
    )`);
    // Migrate existing categories table
    db.run('ALTER TABLE categories ADD COLUMN image TEXT', (err) => {});

    // Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      currentPrice REAL NOT NULL,
      cutPrice REAL NOT NULL,
      rating REAL NOT NULL,
      image TEXT,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    )`);

    // Seed Data if empty
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (!err && row.count === 0) {
        console.log("Seeding categories and products...");
        const seedData = {
          'Veggies': [
            { name: 'Pumpkin', quantity: '500 grams', currentPrice: 25, image: '/products/pumpkin.png' },
            { name: 'Green chilli (Grade - A)', quantity: '100 grams', currentPrice: 15, image: '/products/chilli.png' },
            { name: 'Garlic', quantity: '250 grams', currentPrice: 50, image: '/products/garlic.png' },
            { name: 'Cucumber', quantity: '1 kg', currentPrice: 80, image: '/products/cucumber.png' },
            { name: 'Carrot', quantity: '500 grams', currentPrice: 30, image: '/products/carrot.png' },
            { name: 'Lau', quantity: '500 grams', currentPrice: 30, image: '/products/lau.png' },
            { name: 'Potato', quantity: '1 kg', currentPrice: 20, image: '/products/potato.png' },
            { name: 'Ginger', quantity: '250 grams', currentPrice: 35, image: '/products/ginger.png' },
            { name: 'Beans', quantity: '100 grams', currentPrice: 15, image: '/products/beans.png' },
            { name: 'Tomato', quantity: '1 kg', currentPrice: 50, image: '/products/tomato.png' },
            { name: 'Green Pepe', quantity: '1 kg', currentPrice: 35, image: '/products/papaya.png' },
            { name: 'Green chilli (Grade - A)', quantity: '1 piece', currentPrice: 8, image: '/products/chilli.png' },
            { name: 'Kalmi Saag', quantity: '1 bunch', currentPrice: 10, image: '/products/kalmi.png' },
            { name: 'Dhaniya Pata', quantity: '100 grams', currentPrice: 20, image: '/products/dhaniya.png' },
            { name: 'Begun', quantity: '500 grams', currentPrice: 35, image: '/products/begun.png' },
            { name: 'Corola', quantity: '1 kg', currentPrice: 55, image: '/products/corola.png' },
            { name: 'Lady Finger', quantity: '1 kg', currentPrice: 55, image: '/products/ladyfinger.png' },
            { name: 'Potol', quantity: '500 grams', currentPrice: 30, image: '/products/parwal.png' },
            { name: 'Onion', quantity: '1 kg', currentPrice: 35, image: '/products/onion.png' }
          ],
          'Fruits': [
            { name: 'Lucknow Mango', quantity: '1 kg', currentPrice: 50, image: '/products/mango.png' },
            { name: 'Watermelon', quantity: '1 kg', currentPrice: 50, image: '/products/watermelon.png' },
            { name: 'Premium Kashmiri Apple', quantity: '1 kg', currentPrice: 320, image: '/products/apple.png' }
          ],
          'Grocery': [
            { name: 'Rice', quantity: '1 kg', currentPrice: 100, image: '/products/rice.png' },
            { name: 'Wheat', quantity: '1 kg', currentPrice: 100, image: '/products/wheat.png' },
            { name: 'Bread', quantity: '500 grams', currentPrice: 50, image: '/products/bread.png' }
          ],
          'Milk products': [
            { name: 'Pure Cow Milk', quantity: '500 ml', currentPrice: 30, image: '/products/milk.png' },
            { name: 'Ghee', quantity: '1 kg', currentPrice: 120, image: '/products/ghee.png' },
            { name: 'Butter', quantity: '500 grams', currentPrice: 60, image: '/products/butter.png' },
            { name: 'Paneer', quantity: '1 kg', currentPrice: 100, image: '/products/paneer.png' }
          ],
          'Meat': [
            { name: 'Whole Chicken', quantity: '1 kg', currentPrice: 200, image: '/products/whole_chicken.png' },
            { name: 'Cut Chicken', quantity: '1 kg', currentPrice: 250, image: '/products/cut_chicken.png' },
            { name: 'Whole Mutton', quantity: '1 kg', currentPrice: 800, image: '/products/mutton.png' },
            { name: 'Cut Mutton', quantity: '1 kg', currentPrice: 1000, image: '/products/cut_mutton.png' }
          ],
          'Fish': [
            { name: 'Rohu', quantity: '1 kg', currentPrice: 200, image: '/products/rohu.png' },
            { name: 'Katla', quantity: '1 kg', currentPrice: 250, image: '/products/katla.png' },
            { name: 'Chingri', quantity: '1 kg', currentPrice: 800, image: '/products/chingri.png' },
            { name: 'Elish', quantity: '1 kg', currentPrice: 1000, image: '/products/elish.png' }
          ],
          'Eggs': [
            { name: 'Chicken Eggs', quantity: '12 pcs', currentPrice: 70, image: '/products/chicken_eggs.png' },
            { name: 'Duck Eggs', quantity: '12 pcs', currentPrice: 100, image: '/products/duck_eggs.png' }
          ],
          'Flowers': [
            { name: 'Genda phool', quantity: '1 pc mala', currentPrice: 30, image: '/products/genda_phool.png' }
          ]
        };
        
        for (const [categoryName, products] of Object.entries(seedData)) {
          db.run(`INSERT INTO categories (name) VALUES (?)`, [categoryName], function(err) {
            if (!err) {
              const categoryId = this.lastID;
              const stmt = db.prepare(`INSERT INTO products (category_id, name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)`);
              for (const p of products) {
                const cutPrice = 200;
                const rating = parseFloat((4 + (p.name.charCodeAt(0) % 10) / 10).toFixed(1));
                stmt.run([categoryId, p.name, p.quantity, p.currentPrice, cutPrice, rating, p.image]);
              }
              stmt.finalize();
            }
          });
        }
      }
    });
  }
});

// API Routes

// 1. Create a new order
app.post('/api/orders', (req, res) => {
  const { id, date, items, grandTotal, deliveryDetails } = req.body;
  const userEmail = deliveryDetails.email || '';
  const userPhone = deliveryDetails.phone || '';
  const status = 'Placed';

  const sql = `INSERT INTO orders (id, date, items, grandTotal, deliveryDetails, userEmail, userPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [id, date, JSON.stringify(items), grandTotal, JSON.stringify(deliveryDetails), userEmail, userPhone, status], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Order created successfully', id });
  });
});

// 2. Get all orders (for Admin)
app.get('/api/orders', (req, res) => {
  db.all(`SELECT * FROM orders ORDER BY date DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Parse JSON strings back to objects
    const orders = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items),
      deliveryDetails: JSON.parse(row.deliveryDetails)
    }));
    res.json(orders);
  });
});

// 3. Get orders by user phone (for Frontend)
// Since we shifted to using user.phone in App.jsx to find orders
app.get('/api/orders/user/:phone', (req, res) => {
  const phone = req.params.phone;
  db.all(`SELECT * FROM orders WHERE userPhone = ? ORDER BY date DESC`, [phone], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const orders = rows.map(row => ({
      ...row,
      items: JSON.parse(row.items),
      deliveryDetails: JSON.parse(row.deliveryDetails)
    }));
    res.json(orders);
  });
});

// 4. Update order status (for Admin)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status, eta } = req.body;
  const { id } = req.params;

  let query = `UPDATE orders SET status = ?`;
  let params = [status];

  if (eta !== undefined) {
    query += `, eta = ?`;
    params.push(eta);
  }
  query += ` WHERE id = ?`;
  params.push(id);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated successfully', id, status, eta });
  });
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM orders WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully', id });
  });
});

// CUSTOMERS API ROUTES

// 5. Register or update customer
app.post('/api/customers', (req, res) => {
  const { email, name, phone, picture } = req.body;
  const joinedDate = new Date().toISOString();

  const sql = `INSERT INTO customers (email, name, phone, picture, joinedDate) 
               VALUES (?, ?, ?, ?, ?) 
               ON CONFLICT(email) DO UPDATE SET phone=excluded.phone, name=excluded.name, picture=excluded.picture`;
  
  db.run(sql, [email, name, phone, picture, joinedDate], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Customer saved successfully', email });
  });
});

// 6. Get a specific customer by email (for Frontend Login)
app.get('/api/customers/:email', (req, res) => {
  const email = req.params.email;
  db.get(`SELECT * FROM customers WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(row);
  });
});

// 7. Get all customers with their order count (for Admin)
app.get('/api/customers', (req, res) => {
  const sql = `
    SELECT c.*, COUNT(o.id) as orderCount 
    FROM customers c
    LEFT JOIN orders o ON c.email = o.userEmail
    GROUP BY c.email
    ORDER BY c.joinedDate DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// 8. Rate and review an order
app.patch('/api/orders/:id/rate', (req, res) => {
  const { rating, review } = req.body;
  const { id } = req.params;

  db.run(`UPDATE orders SET rating = ?, review = ? WHERE id = ?`, [rating, review, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order rated successfully', id, rating, review });
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

// --- INVENTORY API (Categories & Products) ---

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all(`SELECT * FROM categories ORDER BY id ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create category
app.post('/api/categories', upload.single('image'), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  
  db.run(`INSERT INTO categories (name, image) VALUES (?, ?)`, [name, image], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, image });
  });
});

// Update category
app.put('/api/categories/:id', upload.single('image'), (req, res) => {
  const { name } = req.body;
  
  if (req.file) {
    const image = `/uploads/${req.file.filename}`;
    db.run(`UPDATE categories SET name = ?, image = ? WHERE id = ?`, [name, image, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, name, image });
    });
  } else {
    db.run(`UPDATE categories SET name = ? WHERE id = ?`, [name, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, name });
    });
  }
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
  db.run(`DELETE FROM categories WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get all products (or by category)
app.get('/api/products', (req, res) => {
  let sql = `SELECT * FROM products ORDER BY id DESC`;
  let params = [];
  if (req.query.categoryId) {
    sql = `SELECT * FROM products WHERE category_id = ? ORDER BY id DESC`;
    params = [req.query.categoryId];
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create product
app.post('/api/products', upload.single('image'), (req, res) => {
  const { category_id, name, quantity, currentPrice, cutPrice, rating } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  
  db.run(`INSERT INTO products (category_id, name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [category_id, name, quantity, currentPrice, cutPrice, rating, image], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, category_id, name, quantity, currentPrice, cutPrice, rating, image });
  });
});

// Update product
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const { category_id, name, quantity, currentPrice, cutPrice, rating } = req.body;
  
  if (req.file) {
    const image = `/uploads/${req.file.filename}`;
    db.run(`UPDATE products SET category_id = ?, name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ?, image = ? WHERE id = ?`, 
      [category_id, name, quantity, currentPrice, cutPrice, rating, image, req.params.id], 
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, category_id, name, quantity, currentPrice, cutPrice, rating, image });
    });
  } else {
    db.run(`UPDATE products SET category_id = ?, name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ? WHERE id = ?`, 
      [category_id, name, quantity, currentPrice, cutPrice, rating, req.params.id], 
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, category_id, name, quantity, currentPrice, cutPrice, rating });
    });
  }
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
