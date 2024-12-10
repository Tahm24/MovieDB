const express = require("express");
const router = express.Router();

//Require mainSaves routes and my API routes
const mainSavesRoutes = require("./mainSaves");
const myapiRoutes = require("./APIs");

//Require Env
require('dotenv').config();

//Bcrypt modules
const bcrypt = require("bcrypt");
const saltrounds = 10;

//Validator
const { check, validationResult } = require('express-validator');

//Request Module for APIs
const request = require("request");
//TMDB API Key (Base URL to retrieve recent movies)
const TMDB_API_KEY = process.env.APIkey; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

//Handle session redirect
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./users/login');
    } else { 
        next();
    } 
};

///////////////////////Home Page///////////////////////
//Home Page loading recent movies
router.get("/", redirectLogin, async (req, res) => {
    try {
        //page number using queries and parse into url to load page numbers, default value set to 1 page
        const page = req.query.page || 1; 
        const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;

        request(url, (error, response, body) => {
            if (error) {
                console.error("Error fetching recent movies from TMDB:", error);
                return res.render("home", { movies: [], error: "An error occurred while fetching recent movies.", page: 1, searchQuery: "" });
            }

            const data = JSON.parse(body);

            //check if results exist
            if (data.results && data.results.length > 0) {
                //Movie stores the title, poster and release dates
                const movies = data.results.map((movie) => ({
                    title: movie.title,
                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    releaseDate: movie.release_date,
                }));
                //pass through movies, error message null, page number, and default search query empty into home.ejs
                res.render("home", { movies, error: null, page: Number(page), totalPages: data.total_pages, searchQuery: "" });
            } 
            else {
                res.render("home", { movies: [], error: "No recent movies found.", page: 1, searchQuery: "" });
            }
        });
    } catch (err) {
        console.error("Error:", err);
        res.render("home", { movies: [], error: "An unexpected error occurred.", page: 1, searchQuery: "" });
    }
});

//Home page post method to search movies
router.post("/search", redirectLogin, async (req, res) => {
    try {
        //search query from home page get method
        const searchQuery = req.body.searchQuery;
        //page number using queries and parse into url to load page numbers, default value set to 1 page
        //if the search query is empty, redirect to the home page
        if (!searchQuery || searchQuery.trim() === "") {
            return res.redirect("/");
        }
        const page = req.query.page || 1; 
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=${page}`;

        request(url, (error, response, body) => {
            if (error) {
                console.error("Error searching movies on TMDB:", error);
                return res.render("home", { movies: [], error: "An error occurred while searching for movies.", searchQuery, page: 1 });
            }

            const data = JSON.parse(body);

            if (data.results && data.results.length > 0) {
                //movie stores the title, poster and release dates
                const movies = data.results.map((movie) => ({
                    title: movie.title,
                    poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    releaseDate: movie.release_date,
                }));
                res.render("home", { movies, error: null, searchQuery, page: Number(page), totalPages: data.total_pages });
            } else {
                res.render("home", { movies: [], error: `No results found for "${searchQuery}".`, searchQuery, page: 1 });
            }
        });
    } catch (err) {
        console.error("Error:", err);
        res.render("home", { movies: [], error: "An unexpected error occurred while searching for movies.", searchQuery, page: 1 });
    }
});

//kill session activity
router.get("/logout", redirectLogin, async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.redirect("./users/login");
            }
            res.send('You are now Logged Out <a href="./users/login">Login</a>.');
        });
    } catch (err) {
        console.error("Error:", err);
        res.redirect("./users/login");
    }
});

//Use the routes from mainSaves.js
router.use(mainSavesRoutes);
router.use(myapiRoutes);

module.exports = router;
