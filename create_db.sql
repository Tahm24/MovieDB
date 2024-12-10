# Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

# Drop existing database
DROP DATABASE IF EXISTS movies;

# Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

# Create database
CREATE DATABASE movies;
USE movies;

# Create Details Table
CREATE TABLE IF NOT EXISTS details (
    id INT AUTO_INCREMENT,
    email VARCHAR(70),
    username VARCHAR(30),
    hashedpassword VARCHAR(255),
    PRIMARY KEY (id)
);

# Create Saved Movies Table
CREATE TABLE IF NOT EXISTS saved_movies (
    id INT AUTO_INCREMENT,
    user_id INT, 
    title VARCHAR(255),
    poster VARCHAR(255),
    release_date DATE,
    note TEXT,
    rating INT DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES details(id) ON DELETE CASCADE
);

# Create app user
CREATE USER IF NOT EXISTS 'movies_app'@'localhost' IDENTIFIED BY 'Tahm0-123'; 
GRANT ALL PRIVILEGES ON movies.* TO 'movies_app'@'localhost';
