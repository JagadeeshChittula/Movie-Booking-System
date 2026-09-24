const Movie = require("../models/Movie");

// =============================
// ADD MOVIE
// =============================
const addMovie = async (req, res) => {
  try {

    const {
      title,
      description,
      duration,
      language,
      genre,
      releaseDate,
      posterUrl,
      trailerUrl,
      rating,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !duration ||
      !language ||
      !genre ||
      !releaseDate ||
      !posterUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check for duplicate movie title
    const existingMovie = await Movie.findOne({
      title: { $regex: new RegExp(`^${title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
      isActive: true,
    });
    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: "A movie with this title already exists",
        movie: existingMovie,
      });
    }

    // Create movie
    const movie = await Movie.create({
      title,
      description,
      duration,
      language,
      genre,
      releaseDate,
      posterUrl,
      trailerUrl,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Movie added successfully",
      movie,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET ALL MOVIES
// =============================
const getAllMovies = async (req, res) => {
  try {
    const filter = req.query.all === "true" || req.query.includeInactive === "true" ? {} : { isActive: true };
    const movies = await Movie.find(filter);

    res.status(200).json({
      success: true,
      count: movies.length,
      movies,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET SINGLE MOVIE
// =============================
const getSingleMovie = async (req, res) => {
  try {

    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      movie,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// UPDATE MOVIE
// =============================
const updateMovie = async (req, res) => {
  try {

    const { id } = req.params;

    const updatedMovie =
      await Movie.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
        }
      );

    if (!updatedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie: updatedMovie,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// DELETE MOVIE (SOFT DELETE)
// =============================
const deleteMovie = async (req, res) => {
  try {

    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    // Soft delete
    movie.isActive = false;

    await movie.save();

    res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {addMovie, getAllMovies, getSingleMovie,updateMovie,deleteMovie,};