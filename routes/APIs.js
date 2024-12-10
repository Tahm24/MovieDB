const express = require("express");
const router = express.Router();

//API to fetch all saved movies by username from db
router.get("/movies/:username", async (req, res) => {
    try {
        //Username from link
        const username = req.params.username;
        //SQL query to fetch user ID based on username
        const userSql = "SELECT id FROM details WHERE username = ?";
        const [userResults] = await db.promise().query(userSql, [username]);

        if (userResults.length === 0) {
            //if no user is found
            return res.status(404).json({ error: "User not found." });
        }

        const userId = userResults[0].id;

        //SQL query to fetch saved movies based on user ID
        const moviesSql = "SELECT * FROM saved_movies WHERE user_id = ? ORDER BY id DESC";
        const [moviesResults] = await db.promise().query(moviesSql, [userId]);

        //Respond with user ID and movies in JSON format
        res.json({ username, userId, movies: moviesResults });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "An error occurred with the DB checking." });
    }
});

module.exports = router;
