const express = require("express");

const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/DBConnection");

const authRoutes = require("./routes/authRoutes");

const movieRoutes = require("./routes/movieRoutes");

const theatreRoutes = require("./routes/theatreRoutes");

const screenRoutes = require( "./routes/screenRoutes");

const showRoutes = require("./routes/showRoutes");

const seatLockRoutes =require("./routes/seatLockRoutes");

const bookingRoutes =require("./routes/bookingRoutes");

const seatRoutes =require("./routes/seatRoutes");

const clearExpiredLocks =require("./jobs/clearExpiredLocks");

const userRoutes =require("./routes/userRoutes");

const dashboardRoutes =require("./routes/dashboardRoutes");

const paymentRoutes =require("./routes/paymentRoutes");

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());

app.use(express.json());

// Routes
app.use("/auth", authRoutes);

app.use("/movies",movieRoutes);

app.use("/theatres",theatreRoutes);

app.use("/screens",screenRoutes);

app.use("/shows", showRoutes);

app.use("/seat-lock",seatLockRoutes);

app.use("/bookings",bookingRoutes);

app.use("/shows", seatRoutes);

app.use("/users", userRoutes);

app.use("/dashboard",dashboardRoutes);

app.use("/payments",paymentRoutes);








setInterval(() => {
  clearExpiredLocks();
}, 60000);

// Server
app.listen(4000, () => {
  console.log("server is started");
});