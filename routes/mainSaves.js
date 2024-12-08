const express = require("express");
const router = express.Router();

// Middleware to redirect if no user ID/session
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('./users/login');
    }
    next();
};

// Route to view saved movies
router.get("/favourites", redirectLogin, (req, res) => {
    const userId = req.session.userId;

    const sql = "SELECT * FROM saved_movies WHERE user_id = ? ORDER BY id DESC";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching saved movies:", err);
            return res.status(500).send("Error fetching saved movies.");
        }
        res.render("favourites", { movies: results, message: null, searchQuery: "" });
    });
});

//Route to save a movie
router.post("/favourites/saves", redirectLogin, (req, res) => {
    const { title, poster, releaseDate, note, rating } = req.body;
    const userId = req.session.userId;

    const checkSql = "SELECT * FROM saved_movies WHERE user_id = ? AND title = ?";
    db.query(checkSql, [userId, title], (err, results) => {
        if (err) {
            console.error("Error checking for duplicate movie:", err);
            return res.status(500).send("Error saving movie.");
        }

        if (results.length > 0) {
            // If the movie is already saved
            return res.send("Movie already saved in your favourites.");
        }

        const insertSql = "INSERT INTO saved_movies (user_id, title, poster, release_date, note, rating) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(insertSql, [userId, title, poster, releaseDate, note, rating], (err, result) => {
            if (err) {
                console.error("Error saving movie:", err);
                return res.status(500).send("Error saving movie.");
            }
            res.redirect("../favourites");
        });
    });
});

//search
router.post("/favourites/search", redirectLogin, (req, res) => {
    const userId = req.session.userId;
    const searchQuery = req.body.searchQuery;

    const sql = `
        SELECT * 
        FROM saved_movies 
        WHERE user_id = ? AND (title LIKE ? OR note LIKE ?)
        ORDER BY id DESC
    `;
    const query = `%${searchQuery}%`; // Use wildcards for partial matching

    db.query(sql, [userId, query, query], (err, results) => {
        if (err) {
            console.error("Error searching saved movies:", err);
            return res.status(500).send("Error searching saved movies.");
        }
        res.render("favourites", { 
            movies: results, 
            message: `Search results for "${searchQuery}"`, 
            searchQuery 
        });
    });
});

// Route to update a movie's note and rating
router.post("/favourites/update/:id", redirectLogin, (req, res) => {
    const { note, rating } = req.body;
    const movieId = req.params.id;
    const userId = req.session.userId;

    const sql = "UPDATE saved_movies SET note = ?, rating = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [note, rating, movieId, userId], (err, result) => {
        if (err) {
            console.error("Error updating note and rating:", err);
            return res.status(500).send("Error updating note and rating.");
        }
        res.redirect("./favourites");
    });
});

// Route to delete a saved movie
router.post("/favourites/delete/:id", redirectLogin, (req, res) => {
    const movieId = req.params.id;
    const userId = req.session.userId;

    const sql = "DELETE FROM saved_movies WHERE id = ? AND user_id = ?";
    db.query(sql, [movieId, userId], (err, result) => {
        if (err) {
            console.error("Error deleting movie:", err);
            return res.status(500).send("Error deleting movie.");
        }
        res.redirect("https://www.doc.gold.ac.uk/usr/306/favourites");
    });
});

// Route to view recommended movies
router.get("/recommended", redirectLogin, (req, res) => {
    const userId = req.session.userId;

    const sql = `
        SELECT title, poster, release_date, AVG(rating) AS avg_rating
        FROM saved_movies
        WHERE user_id = ?
        GROUP BY title, poster, release_date
        HAVING avg_rating >= 3.5
        ORDER BY avg_rating DESC;
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching recommended movies:", err);
            return res.status(500).send("Error fetching recommended movies.");
        }
        res.render("recommended", { movies: results });
        console.log("Recommended Movies Query Results:", results);

    });
});


module.exports = router;
