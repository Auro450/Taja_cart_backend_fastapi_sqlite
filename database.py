import sqlite3
import json
import os

DB_NAME = os.environ.get("DATABASE_PATH", "taja_cart.db")

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db():
    conn = sqlite3.connect(DB_NAME, check_same_thread=False)
    conn.row_factory = dict_factory
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = dict_factory
    c = conn.cursor()

    # Customers Table
    c.execute('''CREATE TABLE IF NOT EXISTS customers (
      email TEXT PRIMARY KEY,
      name TEXT,
      phone TEXT,
      picture TEXT,
      joinedDate TEXT
    )''')

    # Saved Addresses Table
    c.execute('''CREATE TABLE IF NOT EXISTS saved_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT NOT NULL,
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      landmark TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      FOREIGN KEY (userEmail) REFERENCES customers (email) ON DELETE CASCADE
    )''')

    # Orders Table
    c.execute('''CREATE TABLE IF NOT EXISTS orders (
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
      eta TEXT,
      FOREIGN KEY (userEmail) REFERENCES customers (email)
    )''')

    # Categories Table
    c.execute('''CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      image TEXT
    )''')

    # Products Table
    c.execute('''CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      currentPrice REAL NOT NULL,
      cutPrice REAL NOT NULL,
      rating REAL NOT NULL,
      image TEXT,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    )''')

    # Deals of the Day Table
    c.execute('''CREATE TABLE IF NOT EXISTS deals_of_the_day (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity TEXT NOT NULL,
      currentPrice REAL NOT NULL,
      cutPrice REAL NOT NULL,
      rating REAL NOT NULL,
      image TEXT
    )''')

    # Offers Table
    c.execute('''CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      event_name TEXT NOT NULL,
      discount_percent INTEGER NOT NULL,
      valid_until TEXT NOT NULL
    )''')

    # Settings Table
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )''')
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('FIRST20_ACTIVE', 'true')")
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('MIN_ORDER_FOR_FREE_DELIVERY', '99')")
    c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('DELIVERY_CHARGE', '10')")

    # Hubs Table
    c.execute('''CREATE TABLE IF NOT EXISTS hubs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      radius_km REAL NOT NULL,
      is_active BOOLEAN DEFAULT 1
    )''')

    # Announcements Table
    c.execute('''CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL
    )''')
    c.execute("SELECT COUNT(*) as count FROM announcements")
    if c.fetchone()['count'] == 0:
        c.execute("INSERT INTO announcements (text) VALUES ('🎉 Free delivery above Rs 99/-')")
        c.execute("INSERT INTO announcements (text) VALUES ('⚡ Rs 10/- delivery charge below Rs 99/-')")

    # Reviews Table
    c.execute('''CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT,
      is_featured BOOLEAN DEFAULT 0,
      order_id TEXT UNIQUE
    )''')
    
    # Banners Table
    c.execute('''CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT NOT NULL,
      is_approved BOOLEAN DEFAULT 0
    )''')

    # Notifications Table
    c.execute('''CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Admin Subscriptions Table
    c.execute('''CREATE TABLE IF NOT EXISTS admin_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Settings Table
    c.execute('''CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )''')

    # Seed Categories and Products if empty
    c.execute("SELECT COUNT(*) as count FROM categories")
    if c.fetchone()['count'] == 0:
        print("Seeding categories and products...")
        seed_data = {
          'Veggies': [
            { 'name': 'Pumpkin', 'quantity': '500 grams', 'currentPrice': 25, 'image': '/products/pumpkin.png' },
            { 'name': 'Green chilli (Grade - A)', 'quantity': '100 grams', 'currentPrice': 15, 'image': '/products/chilli.png' },
            { 'name': 'Garlic', 'quantity': '250 grams', 'currentPrice': 50, 'image': '/products/garlic.png' },
            { 'name': 'Cucumber', 'quantity': '1 kg', 'currentPrice': 80, 'image': '/products/cucumber.png' },
            { 'name': 'Carrot', 'quantity': '500 grams', 'currentPrice': 30, 'image': '/products/carrot.png' },
            { 'name': 'Lau', 'quantity': '500 grams', 'currentPrice': 30, 'image': '/products/lau.png' },
            { 'name': 'Potato', 'quantity': '1 kg', 'currentPrice': 20, 'image': '/products/potato.png' },
            { 'name': 'Ginger', 'quantity': '250 grams', 'currentPrice': 35, 'image': '/products/ginger.png' },
            { 'name': 'Beans', 'quantity': '100 grams', 'currentPrice': 15, 'image': '/products/beans.png' },
            { 'name': 'Tomato', 'quantity': '1 kg', 'currentPrice': 50, 'image': '/products/tomato.png' },
            { 'name': 'Green Pepe', 'quantity': '1 kg', 'currentPrice': 35, 'image': '/products/papaya.png' },
            { 'name': 'Green chilli (Grade - A)', 'quantity': '1 piece', 'currentPrice': 8, 'image': '/products/chilli.png' },
            { 'name': 'Kalmi Saag', 'quantity': '1 bunch', 'currentPrice': 10, 'image': '/products/kalmi.png' },
            { 'name': 'Dhaniya Pata', 'quantity': '100 grams', 'currentPrice': 20, 'image': '/products/dhaniya.png' },
            { 'name': 'Begun', 'quantity': '500 grams', 'currentPrice': 35, 'image': '/products/begun.png' },
            { 'name': 'Corola', 'quantity': '1 kg', 'currentPrice': 55, 'image': '/products/corola.png' },
            { 'name': 'Lady Finger', 'quantity': '1 kg', 'currentPrice': 55, 'image': '/products/ladyfinger.png' },
            { 'name': 'Potol', 'quantity': '500 grams', 'currentPrice': 30, 'image': '/products/parwal.png' },
            { 'name': 'Onion', 'quantity': '1 kg', 'currentPrice': 35, 'image': '/products/onion.png' }
          ],
          'Fruits': [
            { 'name': 'Lucknow Mango', 'quantity': '1 kg', 'currentPrice': 50, 'image': '/products/mango.png' },
            { 'name': 'Watermelon', 'quantity': '1 kg', 'currentPrice': 50, 'image': '/products/watermelon.png' },
            { 'name': 'Premium Kashmiri Apple', 'quantity': '1 kg', 'currentPrice': 320, 'image': '/products/apple.png' }
          ],
          'Grocery': [
            { 'name': 'Rice', 'quantity': '1 kg', 'currentPrice': 100, 'image': '/products/rice.png' },
            { 'name': 'Wheat', 'quantity': '1 kg', 'currentPrice': 100, 'image': '/products/wheat.png' },
            { 'name': 'Bread', 'quantity': '500 grams', 'currentPrice': 50, 'image': '/products/bread.png' }
          ],
          'Milk products': [
            { 'name': 'Pure Cow Milk', 'quantity': '500 ml', 'currentPrice': 30, 'image': '/products/milk.png' },
            { 'name': 'Ghee', 'quantity': '1 kg', 'currentPrice': 120, 'image': '/products/ghee.png' },
            { 'name': 'Butter', 'quantity': '500 grams', 'currentPrice': 60, 'image': '/products/butter.png' },
            { 'name': 'Paneer', 'quantity': '1 kg', 'currentPrice': 100, 'image': '/products/paneer.png' }
          ],
          'Meat': [
            { 'name': 'Whole Chicken', 'quantity': '1 kg', 'currentPrice': 200, 'image': '/products/whole_chicken.png' },
            { 'name': 'Cut Chicken', 'quantity': '1 kg', 'currentPrice': 250, 'image': '/products/cut_chicken.png' },
            { 'name': 'Whole Mutton', 'quantity': '1 kg', 'currentPrice': 800, 'image': '/products/mutton.png' },
            { 'name': 'Cut Mutton', 'quantity': '1 kg', 'currentPrice': 1000, 'image': '/products/cut_mutton.png' }
          ],
          'Fish': [
            { 'name': 'Rohu', 'quantity': '1 kg', 'currentPrice': 200, 'image': '/products/rohu.png' },
            { 'name': 'Katla', 'quantity': '1 kg', 'currentPrice': 250, 'image': '/products/katla.png' },
            { 'name': 'Chingri', 'quantity': '1 kg', 'currentPrice': 800, 'image': '/products/chingri.png' },
            { 'name': 'Elish', 'quantity': '1 kg', 'currentPrice': 1000, 'image': '/products/elish.png' }
          ],
          'Eggs': [
            { 'name': 'Chicken Eggs', 'quantity': '12 pcs', 'currentPrice': 70, 'image': '/products/chicken_eggs.png' },
            { 'name': 'Duck Eggs', 'quantity': '12 pcs', 'currentPrice': 100, 'image': '/products/duck_eggs.png' }
          ],
          'Flowers': [
            { 'name': 'Genda phool', 'quantity': '1 pc mala', 'currentPrice': 30, 'image': '/products/genda_phool.png' }
          ]
        }
        
        category_images = {
            'Veggies': '/category-icons/veggies.png',
            'Fruits': '/category-icons/fruits.png',
            'Grocery': '/category-icons/grocery.png',
            'Milk products': '/category-icons/milk.png',
            'Meat': '/category-icons/meat.png',
            'Fish': '/category-icons/fish.png',
            'Eggs': '/category-icons/eggs.png',
            'Flowers': '/category-icons/flowers.png'
        }
        
        for category_name, products in seed_data.items():
            c_image = category_images.get(category_name, None)
            c.execute("INSERT INTO categories (name, image) VALUES (?, ?)", (category_name, c_image))
            category_id = c.lastrowid
            for p in products:
                cutPrice = 200
                rating = round(4 + (ord(p['name'][0]) % 10) / 10, 1)
                c.execute(
                    "INSERT INTO products (category_id, name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (category_id, p['name'], p['quantity'], p['currentPrice'], cutPrice, rating, p['image'])
                )
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
