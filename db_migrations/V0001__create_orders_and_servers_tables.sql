CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('Free', 'Pro', 'VIP')),
    slots INTEGER NOT NULL CHECK (slots > 0),
    days INTEGER NOT NULL CHECK (days > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    server_name VARCHAR(100) NOT NULL,
    game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('SAMP', 'CRMP')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    server_ip VARCHAR(50),
    server_port INTEGER,
    ftp_host VARCHAR(100),
    ftp_user VARCHAR(50),
    ftp_password VARCHAR(100),
    db_host VARCHAR(100),
    db_name VARCHAR(50),
    db_user VARCHAR(50),
    db_password VARCHAR(100),
    status VARCHAR(20) DEFAULT 'installing' CHECK (status IN ('installing', 'running', 'stopped', 'error')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_servers_order ON servers(order_id);