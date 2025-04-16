-- This script will be executed after the database is created
-- No need to create the database or connect to it, as Docker will handle that

-- Create user with privileges (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
    CREATE USER admin WITH ENCRYPTED PASSWORD 'admin-pass';
    GRANT ALL PRIVILEGES ON DATABASE smartcanteen TO admin;
  END IF;
END
$$;

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'customer', 'staff', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS canteens (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    canteen_id INTEGER REFERENCES canteens(id),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    canteen_id INTEGER REFERENCES canteens(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'completed', 'cancelled'
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50),
    payment_id VARCHAR(100),
    preparation_time INTEGER, -- in minutes
    notes TEXT,
    is_bulk_order BOOLEAN DEFAULT FALSE,
    pickup_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders table (drop if exists first)
DROP TRIGGER IF EXISTS update_order_updated_at ON orders;
CREATE TRIGGER update_order_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data only if tables are empty
DO $$
BEGIN
    -- Users
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
        INSERT INTO users (name, email, role) VALUES
        ('Admin User', 'admin@smartcanteen.com', 'admin'),
        ('Staff User', 'staff@smartcanteen.com', 'staff'),
        ('Customer 1', 'customer1@example.com', 'customer'),
        ('Customer 2', 'customer2@example.com', 'customer'),
        ('Customer 3', 'customer3@example.com', 'customer');
    END IF;

    -- Canteens
    IF NOT EXISTS (SELECT 1 FROM canteens LIMIT 1) THEN
        INSERT INTO canteens (name, description, location, owner_id) VALUES
        ('Main Canteen', 'The main campus canteen with diverse cuisine options', 'Main Building', 1),
        ('Coffee Corner', 'Quick coffee and snacks', 'Library Building', 2);
    END IF;

    -- Menu items
    IF NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1) THEN
        INSERT INTO menu_items (name, description, price, category, canteen_id, image_url) VALUES
        ('Chicken Biryani', 'Fragrant rice dish with chicken and spices', 180.00, 'Main Course', 1, '/images/biryani.jpg'),
        ('Veg Thali', 'Complete vegetarian meal with rice, dal, and sabzi', 150.00, 'Main Course', 1, '/images/veg-thali.jpg'),
        ('Masala Dosa', 'Crispy rice crepe with potato filling', 120.00, 'Breakfast', 1, '/images/dosa.jpg'),
        ('Samosa', 'Crispy pastry with savory filling', 30.00, 'Snack', 1, '/images/samosa.jpg'),
        ('Cold Coffee', 'Refreshing cold coffee with ice cream', 80.00, 'Beverage', 2, '/images/cold-coffee.jpg'),
        ('Sandwich', 'Grilled vegetable sandwich', 90.00, 'Snack', 2, '/images/sandwich.jpg'),
        ('French Fries', 'Crispy potato fries', 70.00, 'Sides', 1, '/images/fries.jpg'),
        ('Naan', 'Traditional Indian bread', 30.00, 'Sides', 1, '/images/naan.jpg');
    END IF;

    -- Orders
    IF NOT EXISTS (SELECT 1 FROM orders LIMIT 1) THEN
        INSERT INTO orders (user_id, canteen_id, status, total_amount, payment_status, payment_method, preparation_time, notes)
        VALUES 
        (3, 1, 'pending', 450.00, TRUE, 'card', 15, 'Extra spicy please'),
        (4, 1, 'preparing', 270.00, TRUE, 'cash', 10, NULL),
        (5, 1, 'ready', 150.00, TRUE, 'wallet', 5, NULL),
        (3, 2, 'completed', 170.00, TRUE, 'card', 10, NULL),
        (4, 2, 'pending', 200.00, FALSE, NULL, NULL, 'No sugar in coffee');
    END IF;

    -- Order items
    IF NOT EXISTS (SELECT 1 FROM order_items LIMIT 1) THEN
        INSERT INTO order_items (order_id, menu_item_id, quantity, price, notes)
        VALUES 
        (1, 1, 2, 180.00, NULL), -- 2 Chicken Biryani for order 1
        (1, 8, 3, 30.00, 'Butter naan'), -- 3 Naan for order 1
        (2, 3, 5, 120.00, NULL), -- 2 Masala Dosa for order 2
        (2, 4, 1, 30.00, NULL), -- 1 Samosa for order 2
        (3, 2, 1, 150.00, NULL), -- 1 Veg Thali for order 3
        (4, 5, 1, 80.00, 'Less ice'), -- 1 Cold Coffee for order 4
        (4, 6, 1, 90.00, NULL), -- 1 Sandwich for order 4
        (5, 5, 2, 80.00, NULL), -- 2 Cold Coffee for order 5
        (5, 4, 2, 30.00, 'Well fried'); -- 2 Samosa for order 5
    END IF;
END $$;
