/////API endpoint to use data from favourites

const express = require("express");
const router = express.Router();

//API to fetch all saved movies by username from db
router.get("/movies/:username", (req, res) => {
    //Username from link
    const username = req.params.username;
    //SQL query to fetch user ID based on username
    const userSql = "SELECT id FROM details WHERE username = ?";
    db.query(userSql, [username], (err, userResults) => {
        if (err) {
            console.error("Error fetching user ID:", err);
            return res.status(500).json({ error: "Error fetching user data." });
        }
        if (userResults.length === 0) {
            //if no user is found
            return res.status(404).json({ error: "User not found." });
        }

        const userId = userResults[0].id;

        //SQL query to fetch saved movies based on user ID
        const moviesSql = "SELECT * FROM saved_movies WHERE user_id = ? ORDER BY id DESC";
        db.query(moviesSql, [userId], (err, moviesResults) => {
            if (err) {
                console.error("Error fetching saved movies:", err);
                return res.status(500).json({ error: "Error fetching saved movies." });
            }

            //Respond with user ID and movies in JSON format
            res.json({ username, userId, movies: moviesResults });
        });
    });
});

module.exports = router;
