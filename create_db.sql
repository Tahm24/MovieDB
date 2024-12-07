# Creating the database
CREATE DATABASE IF NOT EXISTS movies;
USE movies;

# Creating Details Table
DROP TABLE IF EXISTS details;
CREATE TABLE IF NOT EXISTS details (
    id INT AUTO_INCREMENT,
    email VARCHAR(50),
    username VARCHAR(30),
    hashedpassword VARCHAR(255),
    PRIMARY KEY(id)
);


# App user
CREATE USER IF NOT EXISTS 'movies_app'@'localhost' IDENTIFIED BY 'Tahm0-123'; 
GRANT ALL PRIVILEGES ON movies.* TO ' movies_app'@'localhost';