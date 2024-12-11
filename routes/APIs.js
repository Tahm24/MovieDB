const express = require("express");
const crypto = require("crypto"); 
const router = express.Router();

//Middleware to redirect 
const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("./users/login");
    }
    next();
};

//Route to API key
router.get("/apiKey", redirectLogin, async (req, res) => {
    try {
        const userId = req.session.userId;

        //query to fetch the API key
        const apiKeySql = "SELECT api_key FROM details WHERE id = ?";
        const [results] = await db.promise().query(apiKeySql, [userId]);

        //if API key doesn't exist, generate and store it
        let apiKey = results[0]?.api_key;
        if (!apiKey) {
            apiKey = crypto.randomBytes(16).toString("hex");
            const updateSql = "UPDATE details SET api_key = ? WHERE id = ?";
            await db.promise().query(updateSql, [apiKey, userId]);
        }


        res.render("apikey", { apiKey });
    } catch (err) {
        console.error("Error fetching or generating API key:", err);
        res.status(500).send("An error occurred while fetching or generating your API key.");
    }
});

//API endpoint to fetch movies using API key
router.get("/movies/:apiKey", async (req, res) => {
    try {
        const { apiKey } = req.params;

        //validate the API key
        const userSql = "SELECT id, username FROM details WHERE api_key = ?";
        const [userResults] = await db.promise().query(userSql, [apiKey]);

        if (userResults.length === 0) {
            return res.status(401).json({ error: "Invalid API key." });
        }

        const { id: userId, username } = userResults[0];

        //fetch fav movies with the user id
        const moviesSql = "SELECT * FROM saved_movies WHERE user_id = ? ORDER BY id DESC";
        const [moviesResults] = await db.promise().query(moviesSql, [userId]);

        //respond with movies in JSON format
        res.json({ username, movies: moviesResults });
    } catch (err) {
        console.error("Error fetching movies using API key:", err);
        res.status(500).json({ error: "An error occurred while fetching movies." });
    }
});

module.exports = router;
