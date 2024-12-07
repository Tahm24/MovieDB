//Express and EJS
const express = require('express');
const ejs = require('ejs');

//Express Sanitizer module
const expressSanitizer = require('express-sanitizer');

//mysql module
const mysql = require('mysql2');

//Express session module
const session = require('express-session');

//Express app intitialise and port number
const app = express();
const port = 90;

//Intialise sessions
app.use(session({
    secret: 'youre_welcomehere',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

//Body-Parser and sanitize starter
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

// Set up public folder (for css and statis js)
app.use(express.static(__dirname + '/public'))

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





// route handlers
const mainRoute = require("./routes/users");
app.use('/users', mainRoute);

const usersRoutes = require('./routes/mainPage');
app.use('/', usersRoutes);

const usersRoutes = require('./routes/mainSaves');
app.use('/saves', usersRoutes);

//Server listening at port
app.listen(port, 
    () => console.log(`Node app listening on port ${port}`)
)