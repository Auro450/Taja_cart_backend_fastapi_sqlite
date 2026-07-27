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

    // Saved Addresses Table
    db.run(`CREATE TABLE IF NOT EXISTS saved_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT NOT NULL,
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES customers (email) ON DELETE CASCADE
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

    // Deals of the Day Table
    db.run(`CREATE TABLE IF NOT EXISTS deals_of_the_day (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      currentPrice REAL NOT NULL,
      cutPrice REAL NOT NULL,
      rating REAL NOT NULL,
      image TEXT
    )`);

    // Offers Table
    db.run(`CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      event_name TEXT NOT NULL,
      discount_percent INTEGER NOT NULL,
      valid_until TEXT NOT NULL
    )`);

    // Settings Table
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`, () => {
      // Initialize FIRST20 toggle if not exists
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('FIRST20_ACTIVE', 'true')`);
    });

    // Hubs Table
    db.run(`CREATE TABLE IF NOT EXISTS hubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      radius_km REAL NOT NULL,
      is_active BOOLEAN DEFAULT 1
    )`);

    // Announcements Table
    db.run(`CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL
    )`, () => {
      // Seed initial announcements
      db.get('SELECT COUNT(*) as count FROM announcements', (err, row) => {
        if (!err && row.count === 0) {
          db.run(`INSERT INTO announcements (text) VALUES ('🎉 Free delivery above Rs 99/-')`);
          db.run(`INSERT INTO announcements (text) VALUES ('⚡ Rs 10/- delivery charge below Rs 99/-')`);
        }
      });
    });

    // Reviews Table
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT,
      is_featured BOOLEAN DEFAULT 0,
      order_id TEXT UNIQUE
    )`, () => {
      // Migration: import existing reviews from orders
      db.all('SELECT * FROM orders WHERE rating > 0', [], (err, rows) => {
        if (err) return;
        rows.forEach(order => {
          try {
            const details = JSON.parse(order.deliveryDetails);
            const customerName = details.name || 'Anonymous';
            db.run(
              `INSERT OR IGNORE INTO reviews (customer_name, rating, text, is_featured, order_id) VALUES (?, ?, ?, ?, ?)`,
              [customerName, order.rating, order.review, 0, order.id]
            );
          } catch(e) {}
        });
      });
    });

    // Banners Table
    db.run(`CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      is_approved BOOLEAN DEFAULT 0
    )`);

    // Notifications Table
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// SAVED ADDRESSES API ROUTES
app.get('/api/addresses/:email', (req, res) => {
  const { email } = req.params;
  db.all('SELECT * FROM saved_addresses WHERE userEmail = ? ORDER BY id DESC', [email], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/addresses', (req, res) => {
  const { userEmail, label, address, landmark, lat, lng } = req.body;
  if (!userEmail || !label || !address || lat == null || lng == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    `INSERT INTO saved_addresses (userEmail, label, address, landmark, lat, lng) VALUES (?, ?, ?, ?, ?, ?)`,
    [userEmail, label, address, landmark, lat, lng],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Address saved successfully', id: this.lastID });
    }
  );
});

app.delete('/api/addresses/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM saved_addresses WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted successfully' });
  });
});

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
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    
    // Also sync to reviews table
    db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
      if (order && !err) {
        try {
          const details = JSON.parse(order.deliveryDetails);
          const customerName = details.name || 'Anonymous';
          db.run(
            `INSERT INTO reviews (customer_name, rating, text, is_featured, order_id) VALUES (?, ?, ?, 0, ?)
             ON CONFLICT(order_id) DO UPDATE SET rating = excluded.rating, text = excluded.text`,
            [customerName, rating, review, id]
          );
        } catch(e) {}
      }
    });

    res.json({ message: 'Order rated successfully', id, rating, review });
  });
});

// OFFERS API ROUTES
app.get('/api/offers', (req, res) => {
  db.all('SELECT * FROM offers ORDER BY valid_until DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/offers', (req, res) => {
  const { code, event_name, discount_percent, valid_until } = req.body;
  if (!code || !event_name || discount_percent == null || !valid_until) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(`INSERT INTO offers (code, event_name, discount_percent, valid_until) VALUES (?, ?, ?, ?)`, 
    [code, event_name, discount_percent, valid_until], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Offer created', id: this.lastID });
  });
});

app.put('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  const { code, event_name, discount_percent, valid_until } = req.body;
  
  db.run(`UPDATE offers SET code = ?, event_name = ?, discount_percent = ?, valid_until = ? WHERE id = ?`,
    [code, event_name, discount_percent, valid_until, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Offer not found' });
      res.json({ message: 'Offer updated successfully' });
  });
});

app.delete('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM offers WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Offer not found' });
    res.json({ message: 'Offer deleted successfully' });
  });
});

// SETTINGS API ROUTES
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/settings', (req, res) => {
  const { key, value } = req.body;
  db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Setting updated successfully' });
  });
});

// HUBS API ROUTES
app.get('/api/hubs', (req, res) => {
  db.all('SELECT * FROM hubs ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/hubs', (req, res) => {
  const { name, lat, lng, radius_km, is_active } = req.body;
  if (!name || lat == null || lng == null || radius_km == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(`INSERT INTO hubs (name, lat, lng, radius_km, is_active) VALUES (?, ?, ?, ?, ?)`, 
    [name, lat, lng, radius_km, is_active ? 1 : 0], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Hub created', id: this.lastID });
  });
});

app.put('/api/hubs/:id', (req, res) => {
  const { id } = req.params;
  const { name, lat, lng, radius_km, is_active } = req.body;
  
  db.run(`UPDATE hubs SET name = ?, lat = ?, lng = ?, radius_km = ?, is_active = ? WHERE id = ?`,
    [name, lat, lng, radius_km, is_active ? 1 : 0, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Hub not found' });
      res.json({ message: 'Hub updated successfully' });
  });
});

app.delete('/api/hubs/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM hubs WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Hub not found' });
    res.json({ message: 'Hub deleted successfully' });
  });
});

// ANNOUNCEMENTS API ROUTES
app.get('/api/announcements', (req, res) => {
  db.all('SELECT * FROM announcements', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/announcements', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing announcement text' });
  
  db.run(`INSERT INTO announcements (text) VALUES (?)`, [text], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Announcement created', id: this.lastID });
  });
});

app.put('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing announcement text' });
  
  db.run(`UPDATE announcements SET text = ? WHERE id = ?`, [text, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ message: 'Announcement updated successfully' });
  });
});

app.delete('/api/announcements/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM announcements WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ message: 'Announcement deleted successfully' });
  });
});

// REVIEWS API ROUTES
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/reviews/featured', (req, res) => {
  db.all('SELECT * FROM reviews WHERE is_featured = 1 ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reviews', (req, res) => {
  const { customer_name, rating, text, is_featured } = req.body;
  db.run(
    `INSERT INTO reviews (customer_name, rating, text, is_featured) VALUES (?, ?, ?, ?)`,
    [customer_name, rating, text, is_featured ? 1 : 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Review created', id: this.lastID });
    }
  );
});

app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const { customer_name, rating, text, is_featured } = req.body;
  db.run(
    `UPDATE reviews SET customer_name = ?, rating = ?, text = ?, is_featured = ? WHERE id = ?`,
    [customer_name, rating, text, is_featured ? 1 : 0, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
      res.json({ message: 'Review updated successfully' });
    }
  );
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM reviews WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  });
});

// BANNERS API ROUTES
app.get('/api/banners', (req, res) => {
  db.all('SELECT * FROM banners ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/banners/active', (req, res) => {
  db.all('SELECT * FROM banners WHERE is_approved = 1 ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/banners', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image is required' });
  
  const image = `/uploads/${req.file.filename}`;
  db.run(`INSERT INTO banners (image, is_approved) VALUES (?, 0)`, [image], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Banner uploaded', id: this.lastID, image });
  });
});

app.put('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  const { is_approved } = req.body;
  db.run(`UPDATE banners SET is_approved = ? WHERE id = ?`, [is_approved ? 1 : 0, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner updated successfully' });
  });
});

app.delete('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM banners WHERE id = ?`, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  });
});

// --- Notifications API ---

// Get all notifications (Admin)
app.get('/api/admin/notifications', (req, res) => {
  db.all('SELECT * FROM notifications ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get active notifications (User)
app.get('/api/notifications', (req, res) => {
  db.all('SELECT * FROM notifications WHERE is_active = 1 ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create notification (Admin)
app.post('/api/admin/notifications', (req, res) => {
  const { text, is_active } = req.body;
  db.run(`INSERT INTO notifications (text, is_active) VALUES (?, ?)`, 
    [text, is_active ? 1 : 0], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, text, is_active: is_active ? 1 : 0 });
  });
});

// Update notification (Admin)
app.put('/api/admin/notifications/:id', (req, res) => {
  const { text, is_active } = req.body;
  db.run(`UPDATE notifications SET text = ?, is_active = ? WHERE id = ?`, 
    [text, is_active ? 1 : 0, req.params.id], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, text, is_active: is_active ? 1 : 0 });
  });
});

// Delete notification (Admin)
app.delete('/api/admin/notifications/:id', (req, res) => {
  db.run(`DELETE FROM notifications WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
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

// --- DEALS OF THE DAY API ---

// Get all deals
app.get('/api/deals', (req, res) => {
  db.all(`SELECT * FROM deals_of_the_day ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create deal
app.post('/api/deals', upload.single('image'), (req, res) => {
  db.get('SELECT COUNT(*) as count FROM deals_of_the_day', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count >= 10) return res.status(400).json({ error: 'Maximum 10 deals allowed' });

    const { name, quantity, currentPrice, cutPrice, rating } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    
    db.run(`INSERT INTO deals_of_the_day (name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?)`, 
      [name, quantity, currentPrice, cutPrice, rating, image], 
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, quantity, currentPrice, cutPrice, rating, image });
    });
  });
});

// Update deal
app.put('/api/deals/:id', upload.single('image'), (req, res) => {
  const { name, quantity, currentPrice, cutPrice, rating } = req.body;
  
  if (req.file) {
    const image = `/uploads/${req.file.filename}`;
    db.run(`UPDATE deals_of_the_day SET name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ?, image = ? WHERE id = ?`, 
      [name, quantity, currentPrice, cutPrice, rating, image, req.params.id], 
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, name, quantity, currentPrice, cutPrice, rating, image });
    });
  } else {
    db.run(`UPDATE deals_of_the_day SET name = ?, quantity = ?, currentPrice = ?, cutPrice = ?, rating = ? WHERE id = ?`, 
      [name, quantity, currentPrice, cutPrice, rating, req.params.id], 
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, name, quantity, currentPrice, cutPrice, rating });
    });
  }
});

// Delete deal
app.delete('/api/deals/:id', (req, res) => {
  db.run(`DELETE FROM deals_of_the_day WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
