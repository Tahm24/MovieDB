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

router.get("/api/movies", (req, res) => {
    const userId = req.session.userId;

    const sql = "SELECT * FROM saved_movies WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching saved movies:", err);
            return res.status(500).json({ error: "Error fetching saved movies." });
        }
        res.json(results); // Return JSON response
    });
});

// Route to save a movie
router.post("/favourites/saves", redirectLogin, (req, res) => {
    const { title, poster, releaseDate, note } = req.body;
    const userId = req.session.userId;

    const sql = "INSERT INTO saved_movies (user_id, title, poster, release_date, note) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [userId, title, poster, releaseDate, note], (err, result) => {
        if (err) {
            console.error("Error saving movie:", err);
            return res.status(500).send("Error saving movie.");
        }
        res.redirect("/favourites");
    });
});


// Route to search saved movies
router.post("/favourites/search", redirectLogin, (req, res) => {
    const userId = req.session.userId;
    const searchQuery = req.body.searchQuery;

    const sql = `
        SELECT * FROM saved_movies
        WHERE user_id = ? AND (title LIKE ? OR note LIKE ?)
        ORDER BY id DESC
    `;
    const searchTerm = `%${searchQuery}%`;

    db.query(sql, [userId, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error("Error searching saved movies:", err);
            return res.status(500).send("Error searching saved movies.");
        }

        res.render("favourites", { movies: results, message: null, searchQuery });
    });
});

// Route to update a note
router.post("/favourites/update/:id", redirectLogin, (req, res) => {
    const { note } = req.body;
    const movieId = req.params.id;
    const userId = req.session.userId;

    const sql = "UPDATE saved_movies SET note = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [note, movieId, userId], (err, result) => {
        if (err) {
            console.error("Error updating note:", err);
            return res.status(500).send("Error updating note.");
        }
        res.redirect("/favourites");
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
        res.redirect("/favourites");
    });
});

module.exports = router;
