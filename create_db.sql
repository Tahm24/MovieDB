# Creating the database
CREATE DATABASE IF NOT EXISTS movies;
USE movies;

# Creating Details Table
DROP TABLE IF EXISTS details;
CREATE TABLE IF NOT EXISTS details (
    id INT AUTO_INCREMENT,
    email VARCHAR(70),
    username VARCHAR(30),
    hashedpassword VARCHAR(255),
    PRIMARY KEY(id)
);


# Create Saved Movies Table
DROP TABLE IF EXISTS saved_movies;
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




# App user
CREATE USER IF NOT EXISTS 'movies_app'@'localhost' IDENTIFIED BY 'Tahm0-123'; 
GRANT ALL PRIVILEGES ON movies.* TO 'movies_app'@'localhost';
