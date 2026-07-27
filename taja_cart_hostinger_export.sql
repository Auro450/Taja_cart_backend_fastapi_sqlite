/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: announcements
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: banners
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` text NOT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 4 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: categories
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `image` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE = InnoDB AUTO_INCREMENT = 9 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: customers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `customers` (
  `email` varchar(255) NOT NULL,
  `name` text,
  `phone` text,
  `picture` text,
  `joinedDate` text,
  PRIMARY KEY (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: deals_of_the_day
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deals_of_the_day` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `quantity` text NOT NULL,
  `currentPrice` double NOT NULL,
  `cutPrice` double NOT NULL,
  `rating` double NOT NULL,
  `image` text,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: hubs
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  `radius_km` double NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: notifications
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: offers
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `event_name` text NOT NULL,
  `discount_percent` int NOT NULL,
  `valid_until` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: orders
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(255) NOT NULL,
  `date` text,
  `items` text,
  `grandTotal` double DEFAULT NULL,
  `deliveryDetails` text,
  `userEmail` varchar(255) DEFAULT NULL,
  `userPhone` text,
  `status` text,
  `rating` int DEFAULT NULL,
  `review` text,
  `eta` text,
  PRIMARY KEY (`id`),
  KEY `userEmail` (`userEmail`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userEmail`) REFERENCES `customers` (`email`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `name` text,
  `quantity` text,
  `currentPrice` double DEFAULT NULL,
  `cutPrice` double DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `image` text,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 40 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: reviews
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` text NOT NULL,
  `rating` int NOT NULL,
  `text` text,
  `is_featured` tinyint(1) DEFAULT '0',
  `order_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: saved_addresses
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `saved_addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userEmail` varchar(255) NOT NULL,
  `label` text NOT NULL,
  `address` text NOT NULL,
  `landmark` text,
  `lat` double NOT NULL,
  `lng` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userEmail` (`userEmail`),
  CONSTRAINT `saved_addresses_ibfk_1` FOREIGN KEY (`userEmail`) REFERENCES `customers` (`email`) ON DELETE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: settings
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `settings` (
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: announcements
# ------------------------------------------------------------

INSERT INTO
  `announcements` (`id`, `text`)
VALUES
  (1, '? Free delivery above Rs 99/-');
INSERT INTO
  `announcements` (`id`, `text`)
VALUES
  (2, '⚡ Rs 10/- delivery charge below Rs 99/-');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: banners
# ------------------------------------------------------------

INSERT INTO
  `banners` (`id`, `image`, `is_approved`)
VALUES
  (1, '/uploads/1785162744676-833176532.png', 1);
INSERT INTO
  `banners` (`id`, `image`, `is_approved`)
VALUES
  (3, '/uploads/1785162777025-634653385.png', 1);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: categories
# ------------------------------------------------------------

INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (1, 'Vegetables', '/category-icons/veggies.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (2, 'Fruits', '/category-icons/fruits.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (3, 'Grocery', '/category-icons/grocery.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (4, 'Milk products', '/category-icons/milk.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (5, 'Meat', '/category-icons/meat.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (6, 'Fish', '/category-icons/fish.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (7, 'Eggs', '/category-icons/eggs.png');
INSERT INTO
  `categories` (`id`, `name`, `image`)
VALUES
  (8, 'Flowers', '/category-icons/flowers.png');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: customers
# ------------------------------------------------------------

INSERT INTO
  `customers` (`email`, `name`, `phone`, `picture`, `joinedDate`)
VALUES
  (
    'somshubhrarka@gmail.com',
    'SOMSHUBHRA DAS',
    '9804673546',
    'https://lh3.googleusercontent.com/a/ACg8ocKcw2_5KrETC9_QM2Ykp4J1IKziXeq53Ru1yjl8lhPsaIsuyg=s96-c',
    '2026-07-27T14:37:15.250Z'
  );
INSERT INTO
  `customers` (`email`, `name`, `phone`, `picture`, `joinedDate`)
VALUES
  ('test@test.com', 'test', '12345', NULL, NULL);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: deals_of_the_day
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: hubs
# ------------------------------------------------------------

INSERT INTO
  `hubs` (`id`, `name`, `lat`, `lng`, `radius_km`, `is_active`)
VALUES
  (1, 'Krishnanagar', 23.4058481, 88.4958935, 18, 1);

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: notifications
# ------------------------------------------------------------

INSERT INTO
  `notifications` (`id`, `text`, `is_active`, `created_at`)
VALUES
  (
    2,
    'Monsoon Sale!! Coming Soon!!',
    1,
    '2026-07-27 20:11:18'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: offers
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: orders
# ------------------------------------------------------------

INSERT INTO
  `orders` (
    `id`,
    `date`,
    `items`,
    `grandTotal`,
    `deliveryDetails`,
    `userEmail`,
    `userPhone`,
    `status`,
    `rating`,
    `review`,
    `eta`
  )
VALUES
  (
    'TC-39775',
    '27 Jul 2026, 08:10 pm',
    '[{\"id\":8,\"category_id\":1,\"name\":\"Ginger\",\"quantity\":\"250 grams\",\"currentPrice\":35,\"cutPrice\":200,\"rating\":4.6,\"image\":\"/products/ginger.png\",\"qty\":2},{\"id\":16,\"category_id\":1,\"name\":\"Lady Finger\",\"quantity\":\"1 kg\",\"currentPrice\":55,\"cutPrice\":200,\"rating\":4.4,\"image\":\"/products/ladyfinger.png\",\"qty\":4}]',
    290,
    '{\"name\":\"SOMSHUBHRA DAS\",\"phone\":\"9804673546\",\"address\":\"acdsdv \",\"landmark\":\"st\",\"lat\":22.67548,\"lng\":88.443714,\"street\":\"sfb\",\"building\":\"\",\"locality\":\"ww\",\"city\":\"sb\",\"state\":\"Kolkata\",\"email\":\"somshubhrarka@gmail.com\",\"deliveryFee\":0}',
    'somshubhrarka@gmail.com',
    '9804673546',
    'Placed',
    4,
    '',
    NULL
  );
INSERT INTO
  `orders` (
    `id`,
    `date`,
    `items`,
    `grandTotal`,
    `deliveryDetails`,
    `userEmail`,
    `userPhone`,
    `status`,
    `rating`,
    `review`,
    `eta`
  )
VALUES
  (
    'TC-68446',
    '27 Jul 2026, 08:12 pm',
    '[{\"id\":8,\"category_id\":1,\"name\":\"Ginger\",\"quantity\":\"250 grams\",\"currentPrice\":35,\"cutPrice\":200,\"rating\":4.6,\"image\":\"/products/ginger.png\",\"qty\":3}]',
    105,
    '{\"name\":\"SOMSHUBHRA DAS\",\"phone\":\"9804673546\",\"address\":\"acdsdv \",\"landmark\":\"st\",\"lat\":22.67548,\"lng\":88.443714,\"street\":\"sfb\",\"building\":\"\",\"locality\":\"ww\",\"city\":\"sb\",\"state\":\"Kolkata\",\"email\":\"somshubhrarka@gmail.com\",\"deliveryFee\":0}',
    'somshubhrarka@gmail.com',
    '9804673546',
    'Placed',
    NULL,
    NULL,
    NULL
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products
# ------------------------------------------------------------

INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    1,
    1,
    'Pumpkin',
    '500 grams',
    25,
    200,
    4.4,
    '/products/pumpkin.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    2,
    1,
    'Green chilli (Grade - A)',
    '100 grams',
    15,
    200,
    4.7,
    '/products/chilli.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    3,
    1,
    'Garlic',
    '250 grams',
    50,
    200,
    4.1,
    '/products/garlic.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    4,
    1,
    'Cucumber',
    '1 kg',
    80,
    200,
    4.4,
    '/products/cucumber.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    5,
    1,
    'Carrot',
    '500 grams',
    30,
    200,
    4.9,
    '/products/carrot.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    6,
    1,
    'Lau',
    '500 grams',
    30,
    200,
    4.3,
    '/products/lau.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    7,
    1,
    'Potato',
    '1 kg',
    20,
    200,
    4.5,
    '/products/potato.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    8,
    1,
    'Ginger',
    '250 grams',
    35,
    200,
    4.6,
    '/products/ginger.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    9,
    1,
    'Beans',
    '100 grams',
    15,
    200,
    4.2,
    '/products/beans.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    10,
    1,
    'Tomato',
    '1 kg',
    50,
    200,
    4.8,
    '/products/tomato.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    11,
    1,
    'Green Pepe',
    '1 kg',
    35,
    200,
    4.3,
    '/products/papaya.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    12,
    1,
    'Kalmi Saag',
    '1 bunch',
    10,
    200,
    4.7,
    '/products/kalmi.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    13,
    1,
    'Dhaniya Pata',
    '100 grams',
    20,
    200,
    4.9,
    '/products/dhaniya.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    14,
    1,
    'Begun',
    '500 grams',
    35,
    200,
    4.5,
    '/products/begun.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    15,
    1,
    'Corola',
    '1 kg',
    55,
    200,
    4.2,
    '/products/corola.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    16,
    1,
    'Lady Finger',
    '1 kg',
    55,
    200,
    4.4,
    '/products/ladyfinger.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    17,
    1,
    'Potol',
    '500 grams',
    30,
    200,
    4.3,
    '/products/parwal.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    18,
    1,
    'Onion',
    '1 kg',
    35,
    200,
    4.6,
    '/products/onion.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    19,
    2,
    'Lucknow Mango',
    '1 kg',
    50,
    200,
    4.8,
    '/products/mango.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    20,
    2,
    'Watermelon',
    '1 kg',
    50,
    200,
    4.5,
    '/products/watermelon.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    21,
    2,
    'Premium Kashmiri Apple',
    '1 kg',
    320,
    400,
    4.9,
    '/products/apple.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    22,
    3,
    'Rice',
    '1 kg',
    100,
    200,
    4.5,
    '/products/rice.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    23,
    3,
    'Wheat',
    '1 kg',
    100,
    200,
    4.5,
    '/products/wheat.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    24,
    3,
    'Bread',
    '500 grams',
    50,
    200,
    4.5,
    '/products/bread.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    25,
    4,
    'Pure Cow Milk',
    '500 ml',
    30,
    200,
    4.5,
    '/products/milk.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    26,
    4,
    'Ghee',
    '1 kg',
    120,
    200,
    4.5,
    '/products/ghee.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    27,
    4,
    'Butter',
    '500 grams',
    60,
    200,
    4.5,
    '/products/butter.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    28,
    4,
    'Paneer',
    '1 kg',
    100,
    200,
    4.5,
    '/products/paneer.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    29,
    5,
    'Whole Chicken',
    '1 kg',
    200,
    200,
    4.5,
    '/products/whole_chicken.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    30,
    5,
    'Cut Chicken',
    '1 kg',
    250,
    200,
    4.5,
    '/products/cut_chicken.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    31,
    5,
    'Whole Mutton',
    '1 kg',
    800,
    200,
    4.5,
    '/products/mutton.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    32,
    5,
    'Cut Mutton',
    '1 kg',
    1000,
    200,
    4.5,
    '/products/cut_mutton.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    33,
    6,
    'Rohu',
    '1 kg',
    200,
    200,
    4.5,
    '/products/rohu.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    34,
    6,
    'Katla',
    '1 kg',
    250,
    200,
    4.5,
    '/products/katla.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    35,
    6,
    'Chingri',
    '1 kg',
    800,
    200,
    4.5,
    '/products/chingri.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    36,
    6,
    'Elish',
    '1 kg',
    1000,
    200,
    4.5,
    '/products/elish.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    37,
    7,
    'Chicken Eggs',
    '12 pcs',
    70,
    200,
    4.5,
    '/products/chicken_eggs.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    38,
    7,
    'Duck Eggs',
    '12 pcs',
    100,
    200,
    4.5,
    '/products/duck_eggs.png'
  );
INSERT INTO
  `products` (
    `id`,
    `category_id`,
    `name`,
    `quantity`,
    `currentPrice`,
    `cutPrice`,
    `rating`,
    `image`
  )
VALUES
  (
    39,
    8,
    'Genda phool',
    '1 pc mala',
    30,
    200,
    4.5,
    '/products/genda_phool.png'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: reviews
# ------------------------------------------------------------

INSERT INTO
  `reviews` (
    `id`,
    `customer_name`,
    `rating`,
    `text`,
    `is_featured`,
    `order_id`
  )
VALUES
  (1, 'SOMSHUBHRA DAS', 4, '', 0, 'TC-39775');

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: saved_addresses
# ------------------------------------------------------------

INSERT INTO
  `saved_addresses` (
    `id`,
    `userEmail`,
    `label`,
    `address`,
    `landmark`,
    `lat`,
    `lng`
  )
VALUES
  (
    1,
    'somshubhrarka@gmail.com',
    'Home',
    'sfb, ww, sb, Kolkata',
    'st',
    22.67548,
    88.443714
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: settings
# ------------------------------------------------------------

INSERT INTO
  `settings` (`key`, `value`)
VALUES
  ('DELIVERY_CHARGE', '10');
INSERT INTO
  `settings` (`key`, `value`)
VALUES
  ('FIRST20_ACTIVE', 'true');
INSERT INTO
  `settings` (`key`, `value`)
VALUES
  ('MIN_ORDER_FOR_FREE_DELIVERY', '99');

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
