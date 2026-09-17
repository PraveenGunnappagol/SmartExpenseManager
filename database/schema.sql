CREATE DATABASE IF NOT EXISTS smart_expense_manager;

USE smart_expense_manager;


-- =========================================
-- Users
-- =========================================

CREATE TABLE IF NOT EXISTS users
(
    id INT NOT NULL AUTO_INCREMENT,

    username VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY unique_username (username),

    UNIQUE KEY unique_email (email)
);


-- =========================================
-- Categories
-- =========================================

CREATE TABLE IF NOT EXISTS categories
(
    id INT NOT NULL AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    PRIMARY KEY (id),

    UNIQUE KEY unique_category_name (name)
);


-- =========================================
-- Transactions
-- =========================================

CREATE TABLE IF NOT EXISTS transactions
(
    id INT NOT NULL AUTO_INCREMENT,

    user_id INT NOT NULL,

    category_id INT NOT NULL,

    type ENUM('income', 'expense') NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    description VARCHAR(255),

    transaction_date DATE NOT NULL,

    PRIMARY KEY (id),

    KEY user_id (user_id),

    KEY category_id (category_id),

    CONSTRAINT transactions_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT transactions_ibfk_2
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
);


-- =========================================
-- Budgets
-- =========================================

CREATE TABLE IF NOT EXISTS budgets
(
    id INT NOT NULL AUTO_INCREMENT,

    user_id INT NOT NULL,

    category_id INT DEFAULT NULL,

    amount DECIMAL(10,2) NOT NULL,

    month DATE NOT NULL,

    PRIMARY KEY (id),

    KEY user_id (user_id),

    KEY category_id (category_id),

    CONSTRAINT budgets_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT budgets_ibfk_2
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
);


-- =========================================
-- Savings Goals
-- =========================================

CREATE TABLE IF NOT EXISTS savings_goals
(
    id INT NOT NULL AUTO_INCREMENT,

    user_id INT NOT NULL,

    name VARCHAR(150) NOT NULL,

    target_amount DECIMAL(10,2) NOT NULL,

    current_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    target_date DATE,

    PRIMARY KEY (id),

    KEY user_id (user_id),

    CONSTRAINT savings_goals_ibfk_1
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);