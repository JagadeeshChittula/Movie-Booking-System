const express = require("express");
const path = require("path");

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

const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join_show", (showId) => {
    socket.join(String(showId));
  });

  socket.on("leave_show", (showId) => {
    socket.leave(String(showId));
  });
});

// Connect Database
connectDB();

// Middleware
app.use(cors());

app.use(express.json());

// Serve static posters
app.use("/posters", express.static(path.join(__dirname, "public/posters")));

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








const PORT = process.env.PORT || 4000;

setInterval(() => {
  clearExpiredLocks(io);
}, 60000);

// Server
server.listen(PORT, () => {
  console.log(`server is started with Socket.io on port ${PORT}`);
});