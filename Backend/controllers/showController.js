const Show = require("../models/Show");

// =============================
// ADD SHOW
// =============================
const addShow = async (req, res) => {
  try {

    const {
      movie,
      theatre,
      screen,
      showDate,
      startTime,
      endTime,
      ticketPrice,
    } = req.body;

    if (
      !movie ||
      !theatre ||
      !screen ||
      !showDate ||
      !startTime ||
      !endTime ||
      !ticketPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if the screen is already occupied on this date and start time
    const targetDate = new Date(showDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingShow = await Show.findOne({
      screen,
      showDate: { $gte: startOfDay, $lte: endOfDay },
      startTime: startTime.trim(),
      isActive: true,
    });
    if (existingShow) {
      return res.status(409).json({
        success: false,
        message: `A show is already scheduled on this screen at ${startTime} on this date`,
        show: existingShow,
      });
    }

    const show = await Show.create({
      movie,
      theatre,
      screen,
      showDate,
      startTime,
      endTime,
      ticketPrice,
    });

    res.status(201).json({
      success: true,
      message: "Show created successfully",
      show,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET ALL SHOWS
// =============================
const getAllShows = async (req, res) => {
  try {

    const shows = await Show.find({
      isActive: true,
    })
      .populate("movie")
      .populate("theatre")
      .populate("screen");

    res.status(200).json({
      success: true,
      count: shows.length,
      shows,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// =============================
// GET SINGLE SHOW
// =============================
const getSingleShow = async (req, res) => {
  try {

    const show = await Show.findById(
      req.params.id
    )
      .populate("movie")
      .populate("theatre")
      .populate("screen");

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      show,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const updateShow = async (req, res) => {
  try {

    const show =
      await Show.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      show,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
const deleteShow = async (req, res) => {
  try {

    const show =
      await Show.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

    if (!show) {
      return res.status(404).json({
        success: false,
        message: "Show not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Show deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {addShow,getAllShows,getSingleShow,updateShow,deleteShow,};