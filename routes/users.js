// Router module
const express = require("express");
const router = express.Router();

// Bcrypt modules
const bcrypt = require("bcrypt");
const saltrounds = 10;

// Express validator modules
const { check, validationResult } = require("express-validator");

// Handle session redirect
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('https://www.doc.gold.ac.uk/usr/306/users/login');
    } else {
        next();
    }
};

////////////// Handle Registration //////////////
// Register page
router.get("/register", (req, res) => {
    res.render("register.ejs");
});

// Register Post handling
router.post(
    "/registered",
    [
        check("email").isEmail(),
        check("username").isLength({ max: 30 }),
        check("password").isLength({ min: 5 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("Invalid Input");
            return res.send("invalid input")
        }

        const username = req.sanitize(req.body.username);
        const email = req.sanitize(req.body.email);
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

            const plainPassword = req.sanitize(req.body.password);
            if (!plainPassword) {
                return res.status(400).send("Password is required");
            }

            bcrypt.hash(plainPassword, saltrounds, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing the password:", err);
                    return res.status(500).send("Server Error");
                }

                const newRecord = [email, username, hashedPassword];
                const sqlInsert = "INSERT INTO details (email, username, hashedpassword) VALUES (?, ?, ?)";

                db.query(sqlInsert, newRecord, (err, result) => {
                    if (err) {
                        console.error("Error inserting into database:", err);
                        return res.status(500).send("Server Error");
                    }
                    res.send(`Registration successful for ${username}`);
                });
            });
        });
    }
);

////////////// Handle Login //////////////
// Login page
router.get("/login", (req, res) => {
    res.render("login.ejs");
});

// Updated Login Post handling
router.post("/logged", (req, res) => {
    const { username, password } = req.body;

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
                return res.status(500).send("Server Error");
            }

            if (match) {
                req.session.userId = user.id; //saving userid as int to match db scheme requirements
                res.redirect("../");
            } else {
                res.status(401).send('Invalid username or password Try Again');
            }
        });
    });
});

router.get('/about', (req, res) => 
{
    res.render('about')
})


module.exports = router;
