//Router module
const express = require("express");
const router = express.Router();

//Bcrypt modules
const bcrypt = require("bcrypt");
const saltrounds = 10;

//Validator
const { check, validationResult } = require('express-validator');

//Request Module for APIs
const request = require("request");
//TMDB API Key (Base URL to retrieve recent movies)
const TMDB_API_KEY = "30b6bc59b942cd6fefbef352a9e61e36"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

//Handle session redirect
const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login')
    } else { 
        next();
    } 
}


///////////////////////Home Page///////////////////////
//Home Page loading recent movies
router.get("/home", redirectLogin, (req, res) => {
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
            //pass htrough movies, error message null, page number, and default search query empty into home.ejs
            res.render("home", { movies, error: null, page: Number(page), totalPages: data.total_pages, searchQuery: "" });
        } 
        else {
            res.render("home", { movies: [], error: "No recent movies found.", page: 1, searchQuery: "" });
        }
    });
});

//Home page post method to search movies
router.post("/search", (req, res) => {
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
            //Movie stores the title, poster and release dates
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
});


///////////////////////About Page///////////////////////
router.get('/about', function (req, res) {
    res.send("About Page Test 1")                                                              
});


module.exports = router;
