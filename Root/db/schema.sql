-- schema.sql

-- Drop existing tables if they exist
DROP TABLE IF EXISTS health_metrics;
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- Store hashed passwords
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the health_metrics table
CREATE TABLE health_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  weight VARCHAR(20),
  bmi VARCHAR(10),
  exercise VARCHAR(50),
  calories VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
