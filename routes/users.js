//Router module
const express = require("express");
const router = express.Router();

//Bcrypt modules
const bcrypt = require("bcrypt");
const saltrounds = 10;

//Express validator mdules
const { check, validationResult } = require("express-validator");

//Handle session redirect
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('https://www.doc.gold.ac.uk/usr/306/users/login')
    } else { 
        next();
    } 
}

////////////// Handle registration //////////////
//Register page
router.get("/register", function (req, res, next) {
    res.render("register.ejs");
});

//Register Post handling
router.post(
    "/registered",
    [
        check("email").isEmail(),
        check("username").isLength({ max: 30 }),
        check("password").isLength({ min: 5 }),
    ],
    (req, res, next) => {
        //validator redirect check
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Invalid Input");
            return res.redirect("./register");
        }

        //check if username or email already exists
        const username = req.sanitize(req.body.username);
        const email = req.sanitize(req.body.email);
        const sqlCheck = "SELECT * FROM details WHERE username = ? OR email = ?";
        db.query(sqlCheck, [username, email], (err, result) => {
            if (err) {
                console.error("Error checking username/email:", err);
                return next(err);
            }
            const existingUser = result.find((row) => row.username === username);
            const existingEmail = result.find((row) => row.email === email);

            //Send both or indivdual response to user if user or email already exists
            if (existingUser && existingEmail) {
                console.log("Email and Username already in use.");
                return res.send("Email and Username already in use. Please use different Credentials.");
            } 
            
            else if (existingEmail) {
                console.log("Email already exists.");
                return res.send("Email already in use. Please use a different Email.");
            } 
            
            else if (existingUser) {
                console.log("Username already exists.");
                return res.send("Username already exists. Please use a different Username.");
            }
            
            //if username or email does not exist proceed with password hashing and insertion into db 
            const plainPassword = req.sanitize(req.body.password);
            if (!plainPassword) {
                return res.status(400).send("Password is required");
            }

            //Hashing
            bcrypt.hash(plainPassword, saltrounds, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing the password:", err);
                    return next(err);
                }

                const newrecord = [
                    req.sanitize(req.body.email),
                    username,
                    hashedPassword,
                ];

                const sqlquery =
                    "INSERT INTO details (email, username, hashedpassword) VALUES (?,?,?)";

                //inserting new record into the database
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) {
                        console.log("Error inserting into database:", err);
                        return next(err);
                    }
                    console.log(
                        `Insert Successful: Hashed Password: ${hashedPassword} and ${username} and ${req.body.email}`
                    );
                    res.send(
                        `Registration successful. Password has been hashed/Saved to DB for username: ${username}`
                    );
                });
            });
        });
    }
);

////////////// Handle Login //////////////
//Login Page
router.get("/login", (req, res, next) => {
    res.render("login.ejs");
});

//Logged Post
router.post("/logged", (req, res) => {
    const password = req.body.password;
    const sqlquery = "SELECT * FROM details WHERE username = ?";

    db.query(sqlquery, [req.body.username], (err, result) => {
        if (err) {
            console.error("Error fetching user from database:", err);
            return next(err);
        }

        if (result.length === 0) {
            res.send("Username or Password Incorrect");
        } else {
            const user = result[0].hashedpassword;
            bcrypt.compare(password, user, (err, matching) => {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.send("An error has occurred: " + err);
                }
                if (matching) {
                    req.session.userId = req.body.username;
                    res.redirect("../");
                    console.log("Login successful");
                } else {
                    res.send('Username or Password Incorrect <a href='+'/users/login'+'>Login</a>');
                }
            });
        }
    });
});

//Kill session activity 
router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('/users/login')
    }
    res.send('You are now Logged Out <a href='+'/users/login'+'>Login</a>');
    })
})

module.exports = router;
