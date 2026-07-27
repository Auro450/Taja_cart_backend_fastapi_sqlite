const mysqldump = require('mysqldump');
require('dotenv').config();

mysqldump({
  connection: {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'taja_cart',
  },
  dumpToFile: './taja_cart_hostinger_export.sql',
}).then(() => {
  console.log('Database exported successfully to taja_cart_hostinger_export.sql');
}).catch((err) => {
  console.error('Export failed:', err);
});
