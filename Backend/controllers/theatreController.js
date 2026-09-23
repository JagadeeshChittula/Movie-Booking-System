const Theatre = require("../models/Theatre");

// =============================
// ADD THEATRE
// =============================
const addTheatre = async (req, res) => {
  try {

    const {
      name,
      city,
      address,
      description,
      facilities,
    } = req.body;

    // Validation
    if (
      !name ||
      !city ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields",
      });
    }

    const theatre =
      await Theatre.create({
        name,
        city,
        address,
        description,
        facilities,
      });

    res.status(201).json({
      success: true,
      message: "Theatre added successfully",
      theatre,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET ALL THEATRES
// =============================
const getAllTheatres = async (
  req,
  res
) => {
  try {

    const theatres =
      await Theatre.find({
        isActive: true,
      });

    res.status(200).json({
      success: true,
      count: theatres.length,
      theatres,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET SINGLE THEATRE
// =============================
const getSingleTheatre = async (
  req,
  res
) => {
  try {

    const theatre =
      await Theatre.findById(
        req.params.id
      );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }

    res.status(200).json({
      success: true,
      theatre,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const deleteTheatre = async (req, res) => {
  try {

    const theatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Theatre deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const updateTheatre = async (req, res) => {
  try {

    const theatre = await Theatre.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!theatre) {
      return res.status(404).json({
        success: false,
        message: "Theatre not found",
      });
    }

    res.status(200).json({
      success: true,
      theatre,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
module.exports = {addTheatre,getAllTheatres,getSingleTheatre,updateTheatre,deleteTheatre,};