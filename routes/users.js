const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const saltrounds = 10;
const { check, validationResult } = require("express-validator");

//Handle session redirect middleware (if needed in other routes)
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
       //For server
         return res.redirect('https://www.doc.gold.ac.uk/usr/306/users/login');
        //  return res.redirect('/users/login');
    }
    next();
};

//Register Page
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

//Register Post Handling
router.post("/registered",
    [
        check("email").isEmail(),
        check("username").isLength({ max: 30 }),
        check("password").isLength({ min: 5 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Invalid Input:", errors.array());
            return res.send("Invalid input");
        }

        const username = req.sanitize(req.body.username || '');
        const email = req.sanitize(req.body.email || '');
        const plainPassword = req.sanitize(req.body.password || '');

        if (!plainPassword) {
            return res.status(400).send("Password is required");
        }

        const sqlCheck = "SELECT * FROM details WHERE username = ? OR email = ?";
        db.query(sqlCheck, [username, email], (err, result) => {
            if (err) {
                console.error("Error checking username/email:", err);
                return res.status(500).send("Server Error");
            }

            const existingUser = result.find((row) => row.username === username);
            const existingEmail = result.find((row) => row.email === email);

            if (existingUser && existingEmail) {
                return res.send("Email and Username already in use. Please use different credentials.");
            } else if (existingEmail) {
                return res.send("Email already in use. Please use a different Email.");
            } else if (existingUser) {
                return res.send("Username already exists. Please use a different Username.");
            }

            //Hash the password
            bcrypt.hash(plainPassword, saltrounds, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing the password:", err);
                    return res.status(500).send("Server Error");
                }

                const newRecord = [email, username, hashedPassword];
                const sqlInsert = "INSERT INTO details (email, username, hashedpassword) VALUES (?, ?, ?)";

                db.query(sqlInsert, newRecord, (err, insertResult) => {
                    if (err) {
                        console.error("Error inserting into database:", err);
                        return res.status(500).send("Server Error - Registered");
                    }
                    return res.send(`Registration successful. Please <a href="/users/login">Login</a>`);
                });
            });
        });
    }
);

//Login Page
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

//Login POST
router.post("/logged", (req, res) => {
    const username = req.sanitize(req.body.username || '');
    const password = req.sanitize(req.body.password || '');

    if (!username || !password) {
        return res.status(400).send('Username and Password required.');
    }

    const sql = "SELECT * FROM details WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).send("Server Error");
        }

        if (results.length === 0) {
            return res.status(401).send("Invalid username or password.");
        }

        const user = results[0];
        bcrypt.compare(password, user.hashedpassword, (err, match) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).send("Server Error - Login");
            }

            if (match) {
                req.session.userId = user.id;
                return res.redirect("../");
            } else {
                return res.status(401).send('Invalid username or password. Try Again');
            }
        });
    });
});

//About Route
router.get('/about', (req, res) => {
    res.render('about');
});

module.exports = router;