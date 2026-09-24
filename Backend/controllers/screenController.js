const Screen = require("../models/Screen");

// =============================
// ADD SCREEN
// =============================
const addScreen = async (req, res) => {
  try {

    const {
      theatre,
      name,
      screenType,
      totalSeats,
      seatLayout,
    } = req.body;

    // Validation
    if (
      !theatre ||
      !name ||
      !totalSeats ||
      !seatLayout
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields",
      });
    }

    // Check for duplicate screen name in same theatre
    const existingScreen = await Screen.findOne({
      theatre,
      name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
    });
    if (existingScreen) {
      return res.status(409).json({
        success: false,
        message: "A screen with this name already exists in this theatre",
        screen: existingScreen,
      });
    }

    const screen = await Screen.create({
      theatre,
      name,
      screenType,
      totalSeats,
      seatLayout,
    });

    res.status(201).json({
      success: true,
      message: "Screen added successfully",
      screen,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET SCREENS BY THEATRE
// =============================
const getScreensByTheatre =
  async (req, res) => {
    try {

      const screens =
        await Screen.find({
          theatre: req.params.theatreId,
          isActive: true,
        });

      res.status(200).json({
        success: true,
        count: screens.length,
        screens,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };

// =============================
// GET SINGLE SCREEN
// =============================
const getSingleScreen =
  async (req, res) => {
    try {

      const screen =
        await Screen.findById(
          req.params.id
        ).populate("theatre");

      if (!screen) {
        return res.status(404).json({
          success: false,
          message: "Screen not found",
        });
      }

      res.status(200).json({
        success: true,
        screen,
      });

    } catch (error) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  };

  const updateScreen = async (req, res) => {
  try {

    const screen =
      await Screen.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: "Screen not found",
      });
    }

    res.status(200).json({
      success: true,
      screen,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const deleteScreen = async (req, res) => {
  try {

    const screen =
      await Screen.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

    if (!screen) {
      return res.status(404).json({
        success: false,
        message: "Screen not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Screen deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

const getAllScreens = async (req, res) => {
  try {
    const filter = req.query.all === "true" || req.query.includeInactive === "true" ? {} : { isActive: true };
    const screens = await Screen.find(filter)
      .populate("theatre", "name city");

    res.status(200).json({
      success: true,
      count: screens.length,
      screens,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {addScreen,getAllScreens,getScreensByTheatre,getSingleScreen,updateScreen,deleteScreen,};