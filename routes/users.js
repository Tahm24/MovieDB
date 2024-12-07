//Router module
const express = require("express");
const router = express.Router();

//Bcrypt modules
const bcrypt = require("bcrypt");
const saltrounds = 10;

//Validator
const { check, validationResult } = require('express-validator');

//Handle session redirect
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
      res.redirect('./login')
    } else { 
        next();
    } 
}


//////////////Handle registration//////////////
//Register page
router.get('/register', function (req, res, next) {
    res.render('register.ejs');                                                               
});

//Register Post handling
router.post('/registered',
    [
    check('email').isEmail(), 
    check('username').isLength({ max: 30 }), 
    check('password').isLength({ min: 5 }) 
    ], (req, res, next) => {
   
    //Validator redirect check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Invalid Input");
        return res.redirect('./register');
    }

    //PlainPassword storing password
    const plainPassword = req.sanitize(req.body.password);
        if (!plainPassword) {
        return res.status(400).send("Password is required");
    }

    //Hashing
    bcrypt.hash(plainPassword, saltrounds, (err, hashedPassword) => {
        //Error handling
        if (err) {
            console.error("Error hashing the password:", err);
            return next(err);
        }

        //Data from registration form
        let newrecord = [
            req.sanitize(req.body.email),
            req.sanitize(req.body.username),
            hashedPassword
        ];

        let sqlquery = "INSERT INTO details (email, username, hashedpassword) VALUES (?,?,?)";

        //Inserting new record into the database
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) {
                console.log("Error inserting into database:", err);
                return next(err);
            }
            console.log(`Insert Successful: Hashed Password: ${hashedPassword} and ${req.body.username} and ${req.body.email}`);
            res.send(`Password has been hashed/Saved to DB: ${hashedPassword} and ${req.sanitize(req.body.username)}`);

        });

        });
});

//////////////Handle Login//////////////

//Login Page
router.get('/login', (req, res, next) => {
    res.render('login.ejs');                                                             
});

//Logged Post
router.post('/logged', (req, res) => {

    const password = req.body.password;
    const sqlquery = "SELECT * FROM details WHERE username = ?";
    
    db.query(sqlquery, [req.body.username], (err, result) => {
        if (err) {
            console.error("Error inserting into database:", err);
            return next(err);
        }
        
        if(result.length == 0)
            {
                res.send("Username not found.")
            }
            else
            {
                const user = result[0].hashedpassword;
                bcrypt.compare(password, user, (err, matching) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.send("An error has occurred: " + err);
                }
                if (matching) {
                  req.session.userId = req.body.username;
                  console.log("db comparison working")
                }
                else {
                  res.send("Password Incorrect")
                }
              })
          
          
        }
            })
        
    });



    




module.exports = router;
