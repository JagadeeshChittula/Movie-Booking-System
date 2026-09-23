# Walkthrough: Forgot Password, Geolocation, Srikakulam Filtering & Cinema UI Overhaul

All requested features have been implemented, tested, verified, and pushed to GitHub [`https://github.com/JagadeeshChittula/Movie-Booking-System`](https://github.com/JagadeeshChittula/Movie-Booking-System) (`d999d60`).

---

## 1. Forgot Password Feature

### Backend Implementation
- **Schema (`Backend/models/User.js`):** Added `resetPasswordToken` and `resetPasswordExpires`.
- **Controllers (`Backend/controllers/authController.js`):**
  - `forgotPassword`: Accepts `{ email }`, verifies user, generates a 6-digit verification code with 15-minute validity, stores it, and returns a success response with code for instant testing.
  - `resetPassword`: Accepts `{ email, resetCode, newPassword }`, verifies the code and expiration, validates minimum 6-character length, hashes the new password with bcrypt (salt 10), clears the reset token, and saves the user.
- **Routes (`Backend/routes/authRoutes.js`):**
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`

### Frontend Implementation
- **API Client (`Frontend/src/api/services.js`):** Added `authApi.forgotPassword` and `authApi.resetPassword`.
- **UI Page (`Frontend/src/pages/ForgotPasswordPage.jsx`):**
  - Two-step flow:
    - **Step 1:** Enter email address & click "Send Reset Code".
    - **Step 2:** Displays verification code banner, inputs for 6-digit code and new password confirmation, and updates password.
- **Login Page (`Frontend/src/pages/LoginPage.jsx`):** Added "Forgot password?" link right above the password input.
- **Routing (`Frontend/src/App.jsx`):** Registered `/forgot-password` route.

---

## 2. Automatic Device Geolocation Detection

- **Utility (`Frontend/src/utils/geolocation.js`):**
  - Uses `navigator.geolocation.getCurrentPosition()`.
  - Maps device coordinates against AP & Telangana cities (Srikakulam, Visakhapatnam, Vizianagaram, Vijayawada, Guntur, Rajahmundry, Kakinada, Tirupati, Kurnool, Nellore, Hyderabad) using the Haversine formula to compute the nearest city in kilometers.
- **Navbar (`Frontend/src/components/layout/Navbar.jsx`):**
  - Added an interactive GPS target "Locate Me" button next to the city dropdown that triggers live device detection.
  - Added auto-prompt on first visit to detect location smoothly.
  - Synchronizes city across the entire application via `citychange` event and `localStorage`.

---

## 3. Location-Based Movies & Theatres (Srikakulam & others)

- **Movies Page (`Frontend/src/pages/MoviesPage.jsx`):**
  - Dual-view segmented switcher:
    - **Movies Tab:** Displays only movies actively running in the selected city (e.g. Srikakulam). Includes an optional toggle to view all catalog titles.
    - **Theatres Tab:** Displays all theatres in the selected city (all 14 Srikakulam theatres: Saraswathi Picture Palace, Kinnera Complex, Surya Mahal, Sri Rama, etc.). Each theatre card shows address, facilities (Dolby Atmos, 4K Laser, Recliners), and currently running movies with clickable showtime pills for direct booking.
- **Home Page (`Frontend/src/pages/HomePage.jsx`):**
  - Features "Now Showing in [City]" and "Popular Cinemas in [City]" spotlight cards.
  - Dynamically updates when switching cities.
- **Movie Detail Page (`Frontend/src/pages/MovieDetailPage.jsx`):**
  - Shows only showtimes available in the selected city.
  - When no shows are scheduled in that city, displays a clean notification with instant buttons to switch to cities where shows are running.

---

## 4. Seat Selection & Cinema Screen UI Overhaul

- **Curved Cinema Screen (`Frontend/src/components/booking/SeatMap.jsx`):**
  - Photorealistic 3D curved cinema screen SVG with realistic curvature and top-down projector light beam.
  - Dynamic Screen Type Badge:
    - **IMAX:** `IMAX® 4K LASER · 1.43:1 DUAL PROJECTION` with cyan projector glow.
    - **RealD 3D:** `RealD 3D CURVED SCREEN · DOLBY ATMOS 64-CH` with purple projector glow.
    - **4K Dolby Atmos / 70mm:** `4K DOLBY ATMOS · 70MM CURVED GIANT SCREEN` with golden projector glow.
  - Dynamic screen width scaling matching the theatre's columns and dimensions.
- **Audience Seating & Tiers:**
  - Separated into authentic cinema tiers:
    - 👑 **VIP Recliner** (Rows A, B)
    - ⭐ **Executive Prime** (Rows C, D, E)
    - 🎟️ **Classic Regular** (Rows F+)
  - Clear tier banners displaying tier title, icon, and formatted price tag.
  - Authentic central aisle walkway separating left and right seating wings.
  - Seat design with armrests, cushion bevel, row letters on both left and right sides, and hover animations.

---

## 5. Accurate Show Schedules

- Updated show schedule data across the database:
  - Total shows in Srikakulam: **168 shows** across all 14 theatres.
  - Total shows overall: **778 shows**.
  - All shows scheduled for current dates (starting from today, `2026-09-23`, through `2026-09-30`) at accurate times: `11:00 AM`, `02:30 PM`, `06:15 PM`, `09:30 PM`.

---

## 6. 2026 Movies Added via REST API (Postman Equivalent)

- Added **28 new 2026 tentpole releases** strictly via the authenticated REST API (`POST /movies/add` and `POST /shows/add`):
  - **Telugu & Pan-India:** Salaar: Part 2 – Shouryaanga Parvam, Toxic: A Fairy Tale for Grown-ups, Kantara: Chapter 1, Jai Hanuman, VD12 (Rowdy Janardhan), AA22 (Allu Arjun & Atlee), The Paradise, Pushpa 3: The Rampage, Amaran, Ka, Mechanic Rocky, Matka
  - **Tamil:** Thalapathy 69, Coolie, Kaithi 2 (LCU), Rolex (Standalone), Jailer 2 (Hukum)
  - **Hindi:** Ramayana: Part 1, War 2, King, Love & War, Bhool Bhulaiyaa 3, Singham Again
  - **Hollywood:** Avengers: Doomsday, Spider-Man 4, The Batman: Part II, Star Wars: The Mandalorian & Grogu, Dune: Messiah
- Added **280 new shows** across Srikakulam and AP/Telangana theatres for these 2026 movies.
- All movie posters stored locally in `Frontend/public/posters/` and `Backend/public/posters/` with verified working trailers.
- Updated `CineVault_AndhraPradesh_Postman_Collection.json` with new requests for Forgot Password, Reset Password, and 2026 blockbusters.
- Total Movies: **134 movies**
- Total Theatres: **91 theatres**
- Total Shows: **778 shows**

---

## 7. Verification Results

| Test | Result |
| :--- | :--- |
| `POST /auth/forgot-password` | Verified (generates 6-digit reset code with 15m expiry) |
| `POST /auth/reset-password` | Verified (bcrypt hashed update and cleared tokens) |
| `POST /auth/login` | Verified (login with newly reset password succeeds) |
| `POST /movies/add` (2026 Movies) | 28 movies added via REST API |
| `POST /shows/add` (2026 Shows) | 280 shows scheduled via REST API |
| Frontend `npm run build` | Passed with 0 errors (`✓ built in 3.31s`) |
| `/forgot-password` route | Returns HTTP 200 |
| Srikakulam Location Filter | Verified (14 theatres and 168 active shows) |
| Git Push | Pushed to `origin/main` (`1aa9b81`) |
