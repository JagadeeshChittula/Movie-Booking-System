/**
 * seed-all-india.js
 * Expands CineVault catalog across 25+ major Indian cities covering all regions:
 * North, South, West, East, and Central India.
 * Creates realistic theatres, 3 screens per theatre, and schedules shows for existing movies.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Theatre = require("./models/Theatre");
const Screen = require("./models/Screen");
const Movie = require("./models/Movie");
const Show = require("./models/Show");

const CITIES_DATA = [
  // NORTH
  {
    city: "Delhi",
    theatres: [
      { name: "PVR Select Citywalk", address: "Select Citywalk Mall, Saket", facilities: ["IMAX", "4DX", "Recliner"] },
      { name: "PVR Plaza Connaught Place", address: "H Block, Connaught Place", facilities: ["Dolby Atmos", "Recliner"] },
      { name: "INOX Nehru Place", address: "Eros Corporate Tower, Nehru Place", facilities: ["Laser", "Recliner"] },
      { name: "Cinepolis DLF Avenue", address: "Press Enclave Marg, Saket", facilities: ["Macro XE", "Dolby Atmos"] },
      { name: "PVR Vegas Mall Dwarka", address: "Sector 14, Dwarka", facilities: ["IMAX", "PlayHouse"] },
    ],
  },
  {
    city: "Noida",
    theatres: [
      { name: "PVR Superplex Mall of India", address: "Sector 18, Noida", facilities: ["IMAX", "4DX", "Gold Class"] },
      { name: "Wave Cinemas Centerstage", address: "Sector 18, Noida", facilities: ["Dolby Atmos"] },
      { name: "Cinepolis Grand Venice", address: "Kasna Road, Greater Noida", facilities: ["VIP", "Recliner"] },
    ],
  },
  {
    city: "Gurgaon",
    theatres: [
      { name: "PVR Ambience Mall", address: "NH-8, Ambience Island, Gurgaon", facilities: ["IMAX", "Gold Class", "4DX"] },
      { name: "INOX Ardee Mall", address: "Sector 52, Ardee City, Gurgaon", facilities: ["Insignia", "Dolby Atmos"] },
      { name: "Cinepolis Airia Mall", address: "Sector 68, Sohna Road, Gurgaon", facilities: ["Macro XE", "Recliner"] },
    ],
  },
  {
    city: "Jaipur",
    theatres: [
      { name: "Raj Mandir Cinema", address: "Bhagwan Das Road, C-Scheme", facilities: ["Heritage Palace", "Dolby Atmos"] },
      { name: "INOX GT Central", address: "JLN Marg, Malviya Nagar", facilities: ["Insignia", "Laser"] },
      { name: "PVR World Trade Park", address: "Malviya Nagar, Jaipur", facilities: ["IMAX", "4DX"] },
      { name: "Cinepolis Worldmark", address: "Airport Road, Tonk Road", facilities: ["VIP", "Recliner"] },
    ],
  },
  {
    city: "Chandigarh",
    theatres: [
      { name: "PVR Elante Mall", address: "Industrial Area Phase 1", facilities: ["IMAX", "Gold Class"] },
      { name: "Cinepolis Bestech Square", address: "Sector 66, Mohali", facilities: ["Macro XE", "Dolby Atmos"] },
      { name: "INOX CP67 Mall", address: "Sector 67, Mohali", facilities: ["Insignia", "Recliner"] },
    ],
  },
  {
    city: "Lucknow",
    theatres: [
      { name: "PVR Phoenix Palassio", address: "Amar Shaheed Path, Gomti Nagar Ext", facilities: ["IMAX", "Luxe"] },
      { name: "Cinepolis Lulu Mall", address: "Sushant Golf City, Shaheed Path", facilities: ["Macro XE", "VIP"] },
      { name: "INOX Riverside Mall", address: "Vipin Khand, Gomti Nagar", facilities: ["Laser", "Dolby Atmos"] },
      { name: "Wave Cinemas Saharaganj", address: "Hazratganj, Lucknow", facilities: ["Dolby 7.1"] },
    ],
  },

  // WEST
  {
    city: "Mumbai",
    theatres: [
      { name: "PVR ICON Phoenix Palladium", address: "Lower Parel, Mumbai", facilities: ["IMAX", "4DX", "Luxe"] },
      { name: "INOX Megaplex R City", address: "LBS Marg, Ghatkopar West", facilities: ["IMAX", "ScreenX", "MX4D"] },
      { name: "PVR Dynamix Juhu", address: "JVPD Scheme, Juhu, Mumbai", facilities: ["Dolby Atmos", "Recliner"] },
      { name: "Cinepolis Fun Republic", address: "Andheri West, Mumbai", facilities: ["VIP", "Macro XE"] },
      { name: "Maison INOX Jio World Drive", address: "BKC, Bandra Kurla Complex", facilities: ["Rooftop Drive-in", "Insignia"] },
    ],
  },
  {
    city: "Pune",
    theatres: [
      { name: "PVR Phoenix Marketcity Viman Nagar", address: "Viman Nagar, Pune", facilities: ["IMAX", "4DX", "Gold Class"] },
      { name: "Cinepolis Seasons Mall", address: "Magarpatta City, Hadapsar", facilities: ["VIP", "Macro XE"] },
      { name: "INOX Bund Garden", address: "Central Mall, Bund Garden Road", facilities: ["Laser", "Recliner"] },
      { name: "PVR Pavilion Mall", address: "Senapati Bapat Road, Pune", facilities: ["Dolby Atmos", "PVR P[XL]"] },
    ],
  },
  {
    city: "Ahmedabad",
    theatres: [
      { name: "PVR Acropolis Mall", address: "Thaltej Cross Road, SG Highway", facilities: ["4DX", "Dolby Atmos"] },
      { name: "Cinepolis Nexus Ahmedabad One", address: "Vastrapur, Ahmedabad", facilities: ["Macro XE", "VIP"] },
      { name: "INOX Himalaya Mall", address: "Drive In Road, Gurukul", facilities: ["Insignia", "Recliner"] },
      { name: "Rajhans Cinemas Nikol", address: "Nikol Gam Road, Ahmedabad", facilities: ["Dolby Atmos", "Laser"] },
    ],
  },
  {
    city: "Surat",
    theatres: [
      { name: "INOX VR Surat", address: "Dumas Road, Magdalla", facilities: ["Insignia", "Dolby Atmos"] },
      { name: "Rajhans Cinemas Pal", address: "Pal Gam, Surat", facilities: ["VIP", "Recliner"] },
      { name: "PVR Rahul Raj Mall", address: "Piplod, Surat", facilities: ["Dolby Atmos", "Laser"] },
    ],
  },
  {
    city: "Goa",
    theatres: [
      { name: "INOX Panjim", address: "Old GMC Heritage Complex, Panaji", facilities: ["Dolby Atmos", "Recliner"] },
      { name: "INOX Margao", address: "Osia Commercial Complex, Margao", facilities: ["Laser", "Dolby 7.1"] },
      { name: "PVR Mall De Goa", address: "Porvorim, Goa", facilities: ["Dolby Atmos", "Recliner"] },
    ],
  },

  // SOUTH
  {
    city: "Bangalore",
    theatres: [
      { name: "PVR Orion Mall Malleshwaram", address: "Brigade Gateway, Malleshwaram", facilities: ["P[XL]", "4DX", "Gold Class"] },
      { name: "PVR Forum Mall Koramangala", address: "Hosur Road, Koramangala", facilities: ["IMAX", "Dolby Atmos"] },
      { name: "INOX Garuda Mall", address: "Magrath Road, Ashok Nagar", facilities: ["Laser", "Insignia"] },
      { name: "Cinepolis Royal Meenakshi", address: "Bannerghatta Main Road", facilities: ["Macro XE", "VIP"] },
      { name: "PVR Vega City Mall", address: "Bannerghatta Road, Dollar Layout", facilities: ["IMAX", "Superplex"] },
    ],
  },
  {
    city: "Chennai",
    theatres: [
      { name: "SPI Palazzo Forum Vijaya", address: "Vadapalani, Chennai", facilities: ["IMAX", "Dolby Atmos", "Sathyam"] },
      { name: "PVR VR Chennai", address: "Jawaharlal Nehru Road, Anna Nagar", facilities: ["P[XL]", "4DX", "Luxe"] },
      { name: "INOX The Marina Mall", address: "OMR, Egattur, Chennai", facilities: ["Insignia", "Dolby Atmos"] },
      { name: "AGS Cinemas T Nagar", address: "G.N. Chetty Road, T Nagar", facilities: ["4K Laser", "Dolby Atmos"] },
      { name: "Luxe Cinemas Phoenix Marketcity", address: "Velachery, Chennai", facilities: ["IMAX", "Luxe VIP"] },
    ],
  },
  {
    city: "Kochi",
    theatres: [
      { name: "PVR Lulu International Mall", address: "Edappally, Kochi", facilities: ["4DX", "Gold Class", "Dolby Atmos"] },
      { name: "Cinepolis Centre Square Mall", address: "MG Road, Shenoys, Kochi", facilities: ["VIP", "Macro XE"] },
      { name: "PVR Forum Mall Maradu", address: "NH-47 Bypass, Kundannoor", facilities: ["P[XL]", "Laser"] },
    ],
  },
  {
    city: "Coimbatore",
    theatres: [
      { name: "INOX Prozone Mall", address: "Saravanampatti, Coimbatore", facilities: ["Insignia", "Dolby Atmos"] },
      { name: "PVR Brookefields Mall", address: "Brooke Bond Road, Coimbatore", facilities: ["Dolby Atmos", "Laser"] },
      { name: "Broadway Cinemas", address: "Avinashi Road, Coimbatore", facilities: ["EPIQ", "IMAX", "Laser"] },
    ],
  },
  {
    city: "Thiruvananthapuram",
    theatres: [
      { name: "PVR Mall of Travancore", address: "Chacka, Bypass Road", facilities: ["Dolby Atmos", "4DX"] },
      { name: "PVR Lulu Mall Trivandrum", address: "Aakkulam, Kochuveli", facilities: ["P[XL]", "IMAX", "Luxe"] },
      { name: "Ariesplex SL Cinemas", address: "Overbridge, Thampanoor", facilities: ["4K Dual Laser", "Dolby Atmos 64-Ch"] },
    ],
  },

  // EAST
  {
    city: "Kolkata",
    theatres: [
      { name: "INOX South City Mall", address: "Prince Anwar Shah Road, Jadavpur", facilities: ["IMAX", "Insignia"] },
      { name: "PVR Mani Square Mall", address: "EM Bypass, Kankurgachi", facilities: ["Gold Class", "Dolby Atmos"] },
      { name: "Cinepolis Acropolis Mall", address: "Rajdanga Main Road, Kasba", facilities: ["VIP", "Macro XE"] },
      { name: "INOX Quest Mall", address: "Syed Amir Ali Avenue, Park Circus", facilities: ["Insignia", "Laser"] },
      { name: "PVR Avani Riverside Mall", address: "Jagat Banerjee Ghat Road, Howrah", facilities: ["Dolby Atmos", "Laser"] },
    ],
  },
  {
    city: "Bhubaneswar",
    theatres: [
      { name: "INOX DN Regalia Mall", address: "Patrapada, Bhubaneswar", facilities: ["Insignia", "Dolby Atmos"] },
      { name: "Cinepolis Esplanade One Mall", address: "Rasulgarh, Bhubaneswar", facilities: ["Macro XE", "VIP"] },
      { name: "Maharaja Picture Palace", address: "Acharya Vihar, Bhubaneswar", facilities: ["Dolby Atmos", "4K Laser"] },
    ],
  },
  {
    city: "Guwahati",
    theatres: [
      { name: "PVR City Centre Mall", address: "GS Road, Rukmini Gaon", facilities: ["Dolby Atmos", "4DX"] },
      { name: "Cinepolis Central Mall", address: "Christian Basti, GS Road", facilities: ["VIP", "Dolby 7.1"] },
      { name: "Grande Cines", address: "Paltan Bazaar, Guwahati", facilities: ["Dolby Atmos", "Laser"] },
    ],
  },
  {
    city: "Patna",
    theatres: [
      { name: "Cinepolis Patna One Mall", address: "New Dak Bunglow Road", facilities: ["VIP", "Macro XE"] },
      { name: "PVR City Centre Patna", address: "Lodipur, Patna", facilities: ["Dolby Atmos", "Gold Class"] },
      { name: "INOX Regent Fun Cinema", address: "East Gandhi Maidan, Patna", facilities: ["Dolby Atmos"] },
    ],
  },

  // CENTRAL
  {
    city: "Bhopal",
    theatres: [
      { name: "Cinepolis DB City Mall", address: "Arera Hills, MP Nagar, Bhopal", facilities: ["VIP", "Macro XE"] },
      { name: "PVR Aura Mall", address: "Gulmohar Colony, Bhopal", facilities: ["Dolby Atmos", "Recliner"] },
      { name: "INOX Aashima Mall", address: "Hoshangabad Road, Bhopal", facilities: ["Insignia", "Laser"] },
    ],
  },
  {
    city: "Indore",
    theatres: [
      { name: "PVR Treasure Island Mall", address: "MG Road, South Tukoganj", facilities: ["Dolby Atmos", "P[XL]"] },
      { name: "INOX C21 Mall", address: "Vijay Nagar, AB Road", facilities: ["Insignia", "Laser"] },
      { name: "Cinepolis Nexus Indore Central", address: "RNT Marg, Indore", facilities: ["VIP", "Macro XE"] },
    ],
  },
  {
    city: "Nagpur",
    theatres: [
      { name: "PVR Empress City Mall", address: "Near Gandhi Sagar Lake", facilities: ["4DX", "Dolby Atmos"] },
      { name: "INOX Jaswant Tuli Mall", address: "Indora Square, Kamptee Road", facilities: ["Insignia", "Laser"] },
      { name: "Cinepolis Trillium Mall", address: "Medical Square, Nagpur", facilities: ["VIP", "Macro XE"] },
    ],
  },
];

const SCREEN_TYPES = [
  { name: "Screen 1 — IMAX Laser", screenType: "IMAX", rows: 10, cols: 14, basePrice: 420 },
  { name: "Screen 2 — RealD 3D", screenType: "3D", rows: 8, cols: 12, basePrice: 320 },
  { name: "Screen 3 — Dolby Atmos 4K", screenType: "2D", rows: 8, cols: 10, basePrice: 220 },
];

const SHOW_TIMES = [
  { start: "10:30", end: "13:30" },
  { start: "14:15", end: "17:15" },
  { start: "18:00", end: "21:00" },
  { start: "21:45", end: "00:45" },
];

function getUpcomingDates(daysCount = 5) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setUTCHours(12, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

async function main() {
  const uri = process.env.MONGODB;
  if (!uri) {
    console.error("❌ MONGODB env variable not found!");
    process.exit(1);
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("✅ Connected to Database\n");

  // Fetch top 12 active movies to schedule across theatres
  const movies = await Movie.find({ isActive: true }).limit(12);
  if (!movies || movies.length === 0) {
    console.error("❌ No movies found in the database. Please make sure movies are seeded first.");
    process.exit(1);
  }
  console.log(`Using ${movies.length} movies for scheduling: ${movies.map((m) => m.title).slice(0, 5).join(", ")}...`);

  const dates = getUpcomingDates(5);
  let theatresCreated = 0;
  let screensCreated = 0;
  let showsCreated = 0;

  for (const group of CITIES_DATA) {
    const cityName = group.city;

    // Check if city already has theatres
    const existing = await Theatre.countDocuments({ city: cityName });
    if (existing > 0) {
      console.log(`⏩ ${cityName}: already has ${existing} theatres, skipping duplicate insertion.`);
      continue;
    }

    console.log(`\n📍 Seeding city: ${cityName} (${group.theatres.length} cinemas)...`);

    for (const tData of group.theatres) {
      const theatre = await Theatre.create({
        name: tData.name,
        city: cityName,
        address: tData.address,
        description: `Premium cinema experience at ${tData.name}, ${cityName}.`,
        facilities: tData.facilities,
        isActive: true,
      });
      theatresCreated++;

      // Create 3 screens for this theatre
      const screens = [];
      for (const sType of SCREEN_TYPES) {
        const screen = await Screen.create({
          theatre: theatre._id,
          name: sType.name,
          screenType: sType.screenType,
          totalSeats: sType.rows * sType.cols,
          seatLayout: { rows: sType.rows, cols: sType.cols },
          isActive: true,
        });
        screens.push({ screen, basePrice: sType.basePrice });
        screensCreated++;
      }

      // Schedule shows for each screen across upcoming 5 dates
      const showBatch = [];
      for (let d = 0; d < dates.length; d++) {
        const showDate = dates[d];
        for (let sIdx = 0; sIdx < screens.length; sIdx++) {
          const { screen, basePrice } = screens[sIdx];
          const movie = movies[(d + sIdx + theatresCreated) % movies.length];

          // 2 to 3 shows per screen per day to keep DB size healthy
          for (let timeIdx = 0; timeIdx < Math.min(3, SHOW_TIMES.length); timeIdx++) {
            const timeSlot = SHOW_TIMES[(timeIdx + sIdx) % SHOW_TIMES.length];
            showBatch.push({
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
              ticketPrice: basePrice,
              bookedSeats: [],
              isActive: true,
            });
          }
        }
      }

      if (showBatch.length > 0) {
        await Show.insertMany(showBatch);
        showsCreated += showBatch.length;
      }
    }
  }

  console.log("\n==================================================");
  console.log(`🎉 ALL-INDIA SEEDING COMPLETE!`);
  console.log(`- New Theatres Created: ${theatresCreated}`);
  console.log(`- New Screens Created:  ${screensCreated}`);
  console.log(`- New Shows Created:    ${showsCreated}`);

  const totalTheatres = await Theatre.countDocuments();
  const allCities = await Theatre.distinct("city");
  const totalShows = await Show.countDocuments();

  console.log(`\n📊 OVERALL DATABASE STATS NOW:`);
  console.log(`- Total Cities:   ${allCities.length}`);
  console.log(`- Total Theatres: ${totalTheatres}`);
  console.log(`- Total Shows:    ${totalShows}`);
  console.log(`- Cities Covered: ${allCities.sort().join(", ")}`);
  console.log("==================================================");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
