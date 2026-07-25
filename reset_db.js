const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('C:/Users/gtajd/Downloads/Web_Apps/Taja_cart_whole/Taja_cart_backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
});

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
    { name: 'Beans', quantity: '100 grams', currentPrice: 15, cutPrice: 200, rating: 4.6, image: '/products/beans.png' },
    { name: 'Tomato', quantity: '1 kg', currentPrice: 50, cutPrice: 200, rating: 4.9, image: '/products/tomato.png' },
    { name: 'Green Pepe', quantity: '1 kg', currentPrice: 35, cutPrice: 200, rating: 4.1, image: '/products/papaya.png' },
    { name: 'Green chilli (Grade - A)', quantity: '1 piece', currentPrice: 8, cutPrice: 200, rating: 4.6, image: '/products/chilli.png' },
    { name: 'Kalmi Saag', quantity: '1 bunch', currentPrice: 10, cutPrice: 200, rating: 4.5, image: '/products/kalmi.png' },
    { name: 'Dhaniya Pata', quantity: '100 grams', currentPrice: 20, cutPrice: 200, rating: 4.2, image: '/products/dhaniya.png' },
    { name: 'Begun', quantity: '500 grams', currentPrice: 35, cutPrice: 200, rating: 4.5, image: '/products/begun.png' },
    { name: 'Corola', quantity: '1 kg', currentPrice: 55, cutPrice: 200, rating: 4.5, image: '/products/corola.png' },
    { name: 'Lady Finger', quantity: '1 kg', currentPrice: 55, cutPrice: 200, rating: 4.2, image: '/products/ladyfinger.png' },
    { name: 'Potol', quantity: '500 grams', currentPrice: 30, cutPrice: 200, rating: 4.1, image: '/products/parwal.png' },
    { name: 'Onion', quantity: '1 kg', currentPrice: 35, cutPrice: 200, rating: 4.3, image: '/products/onion.png' }
  ]},
  { category: 'Fruits', image: '/category-icons/fruits.png', products: [
    { name: 'Lucknow Mango', quantity: '1 kg', currentPrice: 50, cutPrice: 200, rating: 4.7, image: '/products/mango.png' },
    { name: 'Watermelon', quantity: '1 kg', currentPrice: 50, cutPrice: 200, rating: 4.5, image: '/products/watermelon.png' },
    { name: 'Pemium Kashmiri Apple', quantity: '1 kg', currentPrice: 320, cutPrice: 200, rating: 4.9, image: '/products/apple.png' }
  ]},
  { category: 'Grocery', image: '/category-icons/grocery.png', products: [
    { name: 'Rice', quantity: '1 kg', currentPrice: 100, cutPrice: 200, rating: 4.8, image: '/products/rice.png' },
    { name: 'Wheat', quantity: '1 kg', currentPrice: 100, cutPrice: 200, rating: 4.9, image: '/products/wheat.png' },
    { name: 'Bread', quantity: '500 grams', currentPrice: 50, cutPrice: 200, rating: 4.8, image: '/products/bread.png' }
  ]},
  { category: 'Milk Products', image: '/category-icons/milk.png', products: [
    { name: 'Pure Cow Milk', quantity: '500 ml', currentPrice: 30, cutPrice: 200, rating: 4.8, image: '/products/milk.png' },
    { name: 'Ghee', quantity: '1 kg', currentPrice: 120, cutPrice: 200, rating: 4.7, image: '/products/ghee.png' },
    { name: 'Butter', quantity: '500 grams', currentPrice: 60, cutPrice: 200, rating: 4.4, image: '/products/butter.png' },
    { name: 'Paneer', quantity: '1 kg', currentPrice: 100, cutPrice: 200, rating: 4.6, image: '/products/paneer.png' }
  ]},
  { category: 'Meat', image: '/category-icons/meat.png', products: [
    { name: 'Whole Chicken', quantity: '1 kg', currentPrice: 200, cutPrice: 200, rating: 4.9, image: '/products/chicken.png' },
    { name: 'Cut Chicken', quantity: '1 kg', currentPrice: 250, cutPrice: 200, rating: 4.3, image: '/products/cut_chicken.png' },
    { name: 'Whole Mutton', quantity: '1 kg', currentPrice: 800, cutPrice: 200, rating: 4.4, image: '/products/mutton.png' },
    { name: 'Cut Mutton', quantity: '1 kg', currentPrice: 1000, cutPrice: 200, rating: 4.1, image: '/products/cut_mutton.png' }
  ]},
  { category: 'Fish', image: '/category-icons/fish.png', products: [
    { name: 'Fish', quantity: '1 kg', currentPrice: 200, cutPrice: 200, rating: 4.5, image: '/products/fish.png' },
    { name: 'Katla', quantity: '1 kg', currentPrice: 250, cutPrice: 200, rating: 4.9, image: '/products/katla.png' },
    { name: 'Chingri', quantity: '1 kg', currentPrice: 800, cutPrice: 200, rating: 4.3, image: '/products/chingri.png' },
    { name: 'Elish', quantity: '1 kg', currentPrice: 1000, cutPrice: 200, rating: 4.8, image: '/products/elish.png' }
  ]},
  { category: 'Eggs', image: '/category-icons/eggs.png', products: [
    { name: 'Chicken Eggs', quantity: '12 pcs', currentPrice: 70, cutPrice: 200, rating: 4.3, image: '/products/eggs.png' },
    { name: 'Duck Eggs', quantity: '12 pcs', currentPrice: 100, cutPrice: 200, rating: 4.8, image: '/products/duck_eggs.png' }
  ]}
];

db.serialize(() => {
  db.run("DELETE FROM products");
  db.run("DELETE FROM categories");
  
  const insertCat = db.prepare("INSERT INTO categories (name, image) VALUES (?, ?)");
  const insertProd = db.prepare("INSERT INTO products (category_id, name, quantity, currentPrice, cutPrice, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
  
  let catsInserted = 0;
  
  data.forEach(cat => {
    insertCat.run(cat.category, cat.image, function(err) {
      if (err) console.error(err);
      const catId = this.lastID;
      
      cat.products.forEach(prod => {
        insertProd.run(catId, prod.name, prod.quantity, prod.currentPrice, prod.cutPrice, prod.rating, prod.image);
      });
      
      catsInserted++;
      if (catsInserted === data.length) {
        insertCat.finalize();
        insertProd.finalize();
        console.log("Database seeded successfully.");
      }
    });
  });
});
