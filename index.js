// Express and EJS
const express = require('express');
const ejs = require('ejs');

//Require Env
require('dotenv').config();

//Express Sanitizer module
const expressSanitizer = require('express-sanitizer');

//mysql module
const mysql = require('mysql2'); // Ensure this is mysql2 for better handling
const session = require('express-session');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 if not set

//Generate random String for secret using Crypto function
const sessionSecret = crypto.randomBytes(64).toString('hex');

//Initialize sessions
app.use(session({
    secret: sessionSecret, 
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 20 * 60 * 1000 //20 minutes in milliseconds
    }
}));

// Set view engine to ejs
app.set('view engine', 'ejs')

// Serve static files
app.use('/public', express.static('public'));

// Body Parser and Sanitizer
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

//Database Connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'movies_app',
    password: 'Tahm0-123',
    database: 'movies'
})
//Connection made
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

// Make db accessible globally
global.db = db;

// Route handlers
const mainRoute = require("./routes/users");
app.use('/users', mainRoute);

const usersRoutes = require('./routes/mainPage');
app.use('/', usersRoutes);

app.listen(PORT, () => {
    console.log(`Node server is running on PORT: ${PORT}`)
});
