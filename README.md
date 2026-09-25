# 🎬 CineVault — Full-Stack Movie Ticket Booking System

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.6-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.0.14-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express_5.2-339933?logo=node.js&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas_Mongoose_9.6-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-4.8.1-010101?logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/License-ISC-blue" alt="License" />
</p>

**CineVault** is a commercial-grade, full-stack movie ticket booking web application inspired by platforms like **BookMyShow** and **PVR INOX**. It provides an end-to-end cinema experience for moviegoers and a robust management suite for theatre administrators, complete with real-time seat synchronization, food & beverage concessions, anti-fraud QR ticketing, and an usher gate scanner.

---

## 📑 Table of Contents
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
- [Admin Access & Gatekeeper Portal](#-admin-access--gatekeeper-portal)
- [API Reference](#-api-reference)
- [WebSocket Events](#-websocket-events-socketio)
- [Seeding Sample Data](#-seeding-sample-data)
- [Environment Variables](#-environment-variables)

---

## 🌟 Features

### 👤 Customer Experience
* **Movie Discovery & Catalog**: Browse trending and now-showing titles filtered by city, genre, language, and rating.
* **YouTube Trailers & Synopsis**: Embedded video trailers, synopsis, duration, and censor certifications.
* **Real-Time Interactive Seat Selection**:
  - Live auditorium seat map ($Rows \times Cols$) with automatic tiering (**Premium**, **Executive**, **Regular**).
  - **Instant Multi-Device Sync via WebSockets (Socket.io)**: When another user holds or buys a seat, it locks on your screen in real time with zero latency.
  - **5-Minute Temporary Seat Hold**: Prevents double-booking race conditions while giving customers adequate time to checkout.
* **Food & Beverage (F&B / Concessions)**:
  - In-booking snack ordering (Popcorn tubs, Loaded Nachos, Cold Drinks, and Combos).
  - Quantity controls with live pricing calculations.
* **Promo Codes & Instant Discounts**:
  - Apply coupons like `CINE50` (Flat ₹50 OFF) or `VAULT20` (20% OFF) with real-time bill deduction.
* **Anti-Fraud QR E-Tickets & Boarding Pass**:
  - High-resolution scannable QR code generated per booking (`CINEVAULT_TICKET:<bookingId>`).
  - Boarding-pass style printable digital voucher with clean print-ready CSS (`window.print()`).
* **Order Management**:
  - Full booking history with live status tracking (`Confirmed`, `Admitted`, `Cancelled`).
  - Seamless ticket cancellation with automatic seat release.
* **Theme Customization**: Fluid Dark and Light mode toggle.

### 🛡️ Admin & Cinema Management Panel (`/admin/*`)
* **Live Dashboard**: Aggregated KPIs including total revenue, confirmed vs. cancelled orders, active users, movies, and theatres.
* **Movie Catalog Manager**: Add, edit, or soft-delete movies, upload poster URLs, and attach YouTube trailers.
* **Theatres Management**: Manage multiplex locations, addresses, and premium amenities (IMAX, 4DX, Dolby Atmos, Recliner).
* **Auditorium / Screen Setup**: Configure screen dimensions (rows × columns) and format specifications (2D, 3D, IMAX).
* **Showtime Scheduling**: Map movies to screens and calendar dates with customizable base pricing.
* **Bookings Audit**: Inspect every transaction made across the platform.
* **Usher Gate Scanner (`/admin/scanner`)**: Handheld/web scanner portal for cinema staff to scan customer QR codes, verify attendee identity, check snack vouchers, and click **"Admit Customer / Mark Checked-In"** to prevent duplicate entry.
* **User Accounts Administration**: Monitor registered users and toggle account access (block/unblock).

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + Vite)"]
        UI[Customer UI & Admin Dashboard]
        WS_Client[Socket.io Client]
        HTTP_Client[Axios Client with JWT Interceptors]
        UI --> WS_Client
        UI --> HTTP_Client
    end

    subgraph Server ["Backend (Node.js + Express 5)"]
        Router[REST API Routes]
        Middleware[Auth & Admin Guards]
        Controllers[Business Controllers]
        WS_Server[Socket.io Real-Time Hub]
        CronJob[Expired Locks Cleaner (60s)]
        
        Router --> Middleware
        Middleware --> Controllers
    end

    subgraph Database ["Database (MongoDB Atlas)"]
        Mongoose[(Mongoose ODM 9.6)]
        Collections[(Users, Movies, Theatres, Screens, Shows, Bookings, SeatLocks, Payments)]
        Mongoose --> Collections
    end

    HTTP_Client -->|REST API Requests / Bearer Token| Router
    WS_Client <-->|Bi-directional WebSockets| WS_Server
    Controllers --> Mongoose
    CronJob --> Mongoose
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 (`^19.2.6`) with React Compiler
- **Build Tool**: Vite 8 (`^8.0.12`)
- **Routing**: React Router DOM v7 (`^7.16.0`)
- **Networking**: Axios (`^1.16.1`)
- **Real-Time**: Socket.io Client (`^4.8.1`)
- **QR Generation**: QRCode (`^1.5.4`)
- **Icons**: Lucide React (`^1.17.0`)
- **Styling**: Modern CSS Variables with Dark/Light mode support

### Backend
- **Runtime**: Node.js (v18+)
- **Web Framework**: Express 5 (`^5.2.1`)
- **Real-Time Hub**: Socket.io (`^4.8.1`)
- **Database**: MongoDB Atlas via Mongoose (`^9.6.3`)
- **Authentication**: JWT (`jsonwebtoken ^9.0.3`) & `bcryptjs (^3.0.3)`
- **Cross-Origin**: CORS (`^2.8.6`)
- **Configuration**: dotenv (`^17.4.2`)

---

## 📁 Project Directory Structure

```text
movie-ticket-booking/
├── Backend/
│   ├── config/
│   │   └── DBConnection.js        # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js       # Register, login, user queries
│   │   ├── bookingController.js    # Reservations, confirm, cancel, usher check-in
│   │   ├── dashboardController.js  # Administrative platform metrics
│   │   ├── movieController.js      # Movie catalog management
│   │   ├── paymentController.js    # Payment handling & revenue stats
│   │   ├── screenController.js     # Screen layouts & seat matrices
│   │   ├── seatController.js       # Available & locked seats calculation
│   │   ├── seatLockController.js   # 5-min temporary hold & collision guard
│   │   ├── showController.js       # Show scheduling & pricing
│   │   ├── theatreController.js    # Cinema locations & facilities
│   │   └── userController.js       # Profile, password, user blocking
│   ├── jobs/
│   │   └── clearExpiredLocks.js    # Background seat unlock task (runs every 60s)
│   ├── middleware/
│   │   ├── adminMiddleware.js     # Admin role authorization guard
│   │   └── authMiddleware.js      # Bearer JWT token verification
│   ├── models/
│   │   ├── Booking.js              # Booking schema with snacks & check-in
│   │   ├── Movie.js                # Movie catalog schema
│   │   ├── Payment.js              # Payment gateway transactions
│   │   ├── Screen.js               # Screen configuration & seat dimensions
│   │   ├── SeatLock.js             # Temporary holds with TTL
│   │   ├── Show.js                 # Showtimes & booked seats array
│   │   ├── Theatre.js              # Cinema complex metadata
│   │   └── User.js                 # Customer & Admin accounts
│   ├── routes/                     # Express REST route definitions
│   ├── populate-via-api.js         # API-driven database seeding script
│   ├── server.js                   # HTTP + Socket.io server entry point
│   └── package.json
│
├── Frontend/
│   ├── public/                     # Static assets (favicons, icons)
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js           # Axios instance with auth interceptors
│   │   │   └── services.js         # Modular API service functions
│   │   ├── components/
│   │   │   ├── booking/            # SeatMap, ShowTimePicker
│   │   │   ├── layout/             # Navbar, Footer, MainLayout, AdminLayout
│   │   │   ├── movie/              # HeroBanner, MovieCard, TrailerModal
│   │   │   └── ui/                 # Modal, Loader, EmptyState
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Authentication state & localStorage sync
│   │   │   ├── ThemeContext.jsx    # Dark/Light theme manager
│   │   │   └── ToastContext.jsx    # Floating notification toasts
│   │   ├── data/
│   │   │   └── snacks.js           # F&B snacks and combos catalog
│   │   ├── hooks/
│   │   │   └── useSeatLockTimer.js # Real-time countdown timer hook
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page with trending movies
│   │   │   ├── MoviesPage.jsx      # Filterable movie catalog
│   │   │   ├── MovieDetailPage.jsx # Movie info & showtime picker
│   │   │   ├── SeatSelectionPage.jsx # Live WebSocket seat matrix
│   │   │   ├── CheckoutPage.jsx    # Seats + Snacks + Coupons + Payment
│   │   │   ├── BookingSuccessPage.jsx # Confirmed ticket with QR code
│   │   │   ├── BookingDetailPage.jsx  # Digital E-Ticket & Print PDF
│   │   │   ├── MyBookingsPage.jsx  # Customer ticket history
│   │   │   ├── LoginPage.jsx       # Sign in portal
│   │   │   ├── RegisterPage.jsx    # Sign up portal
│   │   │   └── admin/              # Admin dashboard, managers, and scanner
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminMovies.jsx
│   │   │       ├── AdminTheatres.jsx
│   │   │       ├── AdminScreens.jsx
│   │   │       ├── AdminShows.jsx
│   │   │       ├── AdminBookings.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       └── AdminTicketScanner.jsx # Gatekeeper check-in scanner
│   │   ├── App.jsx                 # Client-side router configuration
│   │   └── index.css               # Design system & theming tokens
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance

---

### 1. Configure the Backend

Navigate to the `Backend` directory:
```bash
cd Backend
npm install
```

Create or verify the `Backend/.env` file:
```env
MONGODB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
# Development mode with hot-reloading
npm run dev

# Or production start
npm start
```
> The server will start with **Socket.io** on **`http://localhost:4000`**.

---

### 2. Configure the Frontend

In a separate terminal, navigate to the `Frontend` directory:
```bash
cd Frontend
npm install
```

Verify or update `Frontend/.env`:
```env
# Point to your local backend (or hosted Render URL)
VITE_API_URL=http://localhost:4000
```

Start the Vite development server:
```bash
npm run dev
```
> Open your browser at **`http://localhost:5173`**.

---

## 🔑 Admin Access & Gatekeeper Portal

The system supports administrator accounts configured in the database:
- **Email:** `admin@example.com` (or your configured admin email)
- **Role:** `admin`

### Logging In:
1. Go to `http://localhost:5173/login`.
2. Sign in with your admin credentials.
3. You will be automatically redirected to the **Admin Dashboard** (`http://localhost:5173/admin`).
4. You will also see a dedicated **"Admin"** navigation item in the top header.

### Gatekeeper Ticket Scanner (`/admin/scanner`):
Cinema ushers can open `http://localhost:5173/admin/scanner`:
- Scan customer QR codes or enter Booking IDs.
- Instantly verify customer identity, movie, screen, seats, and snacks voucher.
- Click **"Admit Customer / Mark Checked-In"** to record admission and prevent ticket re-use.

---

## 📡 API Reference

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | Public |
| `POST` | `/auth/login` | Login and receive Bearer JWT | Public |
| `GET` | `/auth/all-users` | Fetch all user accounts | Admin |

### 🎬 Movies (`/movies`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/movies/all` | List active movies | Public |
| `GET` | `/movies/:id` | Get single movie details | Public |
| `POST` | `/movies/add` | Add a new movie | Admin |
| `PUT` | `/movies/update/:id` | Update movie details | Admin |
| `DELETE` | `/movies/delete/:id` | Soft delete movie | Admin |

### 🏢 Theatres & Screens
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/theatres/all` | List all active cinema complexes | Public |
| `POST` | `/theatres/add` | Add a new theatre complex | Admin |
| `GET` | `/screens/all` | List all screens | Admin |
| `GET` | `/screens/theatre/:theatreId` | List screens belonging to a theatre | Public |
| `POST` | `/screens/add` | Configure a new screen layout | Admin |

### 🎟️ Shows & Seat Locking
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/shows/all` | List active screenings | Public |
| `GET` | `/shows/:id` | Get single show details | Public |
| `GET` | `/shows/:showId/seats` | Get booked and locked seats | Public |
| `POST` | `/shows/add` | Schedule a showtime | Admin |
| `POST` | `/seat-lock/lock` | Hold seats temporarily (5-min TTL) | Protected |
| `POST` | `/seat-lock/release` | Release active seat hold | Protected |

### 💳 Bookings & Payments
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/bookings/create` | Create booking (seats + snacks + discounts) | Protected |
| `GET` | `/bookings/my-bookings`| Get logged-in user's tickets | Protected |
| `GET` | `/bookings/:id` | Get single ticket with deep relation details | Protected |
| `PUT` | `/bookings/confirm/:id`| Confirm booking & permanently occupy seats | Protected |
| `PUT` | `/bookings/cancel/:id` | Cancel booking and release seats | Protected |
| `PUT` | `/bookings/check-in/:id`| Usher gatekeeper entry check-in | Admin |
| `GET` | `/bookings/admin/all` | Audit all bookings across platform | Admin |
| `POST` | `/payments/create` | Record payment transaction | Protected |
| `PUT` | `/payments/success/:id`| Mark payment successful & record revenue | Protected |

---

## ⚡ WebSocket Events (Socket.io)

CineVault connects to rooms keyed by `showId` for real-time seat coordination:

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join_show` | Client ➔ Server | `showId` | Joins the real-time room for an auditorium show |
| `leave_show` | Client ➔ Server | `showId` | Leaves the room upon navigating away |
| `seat_locked` | Server ➔ Clients | `{ show, seats, userId, expiresAt }` | Broadcasts temporary seat holds in milliseconds |
| `seat_released` | Server ➔ Clients | `{ show, seats }` | Broadcasts released seats to all viewers |
| `seat_booked` | Server ➔ Clients | `{ show, seats }` | Broadcasts permanently reserved seats |

---

## 🍿 Seeding Sample Data

To populate popular movies (*Inception, Interstellar, Oppenheimer, Jawan, RRR, Dune: Part Two*), demo theatres, screens, and showtimes, run the API seeder script:

```bash
cd Backend
node populate-via-api.js admin@example.com your_admin_password
```

---

## ⚙️ Environment Variables

### `Backend/.env`
```env
MONGODB=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```

### `Frontend/.env`
```env
VITE_API_URL=http://localhost:4000
```

---

## 🧪 Testing & Verification

Run the linter in `Frontend`:
```bash
npm run lint
```

Build the production bundle in `Frontend`:
```bash
npm run build
```

---

## 📄 License
This project is open-source and licensed under the [ISC License](LICENSE).
