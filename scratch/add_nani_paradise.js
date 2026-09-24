const path = require('path');
const jwt = require(path.resolve(__dirname, '../Backend/node_modules/jsonwebtoken'));
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));

const BASE_URL = 'http://localhost:4000';
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const ADMIN_ID = '6a193b656cca31fe2cd394f5';
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

const adminToken = jwt.sign(
  { id: ADMIN_ID, role: 'admin' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

const paradiseData = {
  title: 'The Paradise',
  language: 'Telugu',
  genre: ['Action', 'Period', 'Crime', 'Drama'],
  description: 'Starring Natural Star Nani, Priyamani, Mohan Babu. Directed by Srikanth Odela. Produced by Sudhakar Cherukuri (SLV Cinemas). Music by Anirudh Ravichander. A raw, intense, and bloodstained period crime action spectacle set against the backdrop of 1980s Telangana.',
  duration: 162,
  releaseDate: '2026-08-28',
  trailerUrl: 'https://www.youtube.com/watch?v=namFQ8wFdIA',
  posterUrl: 'https://img.youtube.com/vi/namFQ8wFdIA/hqdefault.jpg',
  rating: 9.4
};

async function addNaniParadise() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: String,
    description: String,
    duration: Number,
    language: String,
    genre: [String],
    releaseDate: Date,
    posterUrl: String,
    trailerUrl: String,
    rating: Number,
    isActive: Boolean
  }));
  const Theatre = mongoose.model('Theatre', new mongoose.Schema({ name: String, city: String, isActive: Boolean }));
  const Screen = mongoose.model('Screen', new mongoose.Schema({ name: String, theatre: mongoose.Schema.Types.ObjectId, isActive: Boolean }));
  const Show = mongoose.model('Show', new mongoose.Schema({
    theatre: mongoose.Schema.Types.ObjectId,
    screen: mongoose.Schema.Types.ObjectId,
    movie: mongoose.Schema.Types.ObjectId,
    showDate: Date,
    startTime: String,
    endTime: String,
    ticketPrice: Number,
    isActive: Boolean
  }));

  let movie = await Movie.findOne({ title: { $regex: /^The Paradise$/i } });

  if (movie) {
    console.log(`Found existing "${movie.title}" [id: ${movie._id}]. Updating with official Nani & Srikanth Odela data...`);
    const updateRes = await fetch(`${BASE_URL}/movies/update/${movie._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(paradiseData)
    });
    const updateBody = await updateRes.json();
    movie = updateBody.movie || movie;
    console.log('✓ Updated movie details via REST API:', movie.title);
  } else {
    console.log('Creating "The Paradise" via REST API...');
    const addRes = await fetch(`${BASE_URL}/movies/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(paradiseData)
    });
    const addBody = await addRes.json();
    movie = addBody.movie;
    console.log('✓ Added movie via REST API:', movie._id);
  }

  // Schedule shows across Srikakulam, Visakhapatnam, Vijayawada, Hyderabad
  const targetCities = ['Srikakulam', 'Visakhapatnam', 'Vijayawada', 'Hyderabad'];
  const theatres = await Theatre.find({ city: { $in: targetCities }, isActive: { $ne: false } });
  console.log(`\nFound ${theatres.length} theatres across ${targetCities.join(', ')} to schedule shows for "The Paradise".`);

  const standardSlots = [
    { start: '10:30 AM', end: '01:30 PM' },
    { start: '02:00 PM', end: '05:00 PM' },
    { start: '06:00 PM', end: '09:00 PM' },
    { start: '09:30 PM', end: '12:30 AM' }
  ];

  const targetDates = [
    '2026-09-24',
    '2026-09-25',
    '2026-09-26',
    '2026-09-27',
    '2026-09-28'
  ];

  let scheduledShows = 0;
  for (const t of theatres) {
    const screens = await Screen.find({ theatre: t._id, isActive: { $ne: false } });
    if (screens.length === 0) continue;

    for (const screen of screens) {
      for (const dateStr of targetDates) {
        const startOfDay = new Date(dateStr);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Find existing shows on this screen
        const existingShows = await Show.find({
          screen: screen._id,
          showDate: { $gte: startOfDay, $lte: endOfDay },
          isActive: true
        });
        const occupied = new Set(existingShows.map(s => s.startTime.trim()));
        const freeSlots = standardSlots.filter(s => !occupied.has(s.start));

        // Schedule at least one or two shows per day on available slots
        if (freeSlots.length > 0) {
          const slot = freeSlots[0];
          const payload = {
            movie: movie._id,
            theatre: t._id,
            screen: screen._id,
            showDate: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            ticketPrice: t.city === 'Hyderabad' ? 200 : 150
          };

          const addRes = await fetch(`${BASE_URL}/shows/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
          });

          if (addRes.status === 201) {
            scheduledShows++;
          }
        }
      }
    }
  }

  console.log(`\n🎉 Successfully scheduled ${scheduledShows} shows for "The Paradise" via REST API!`);

  // Final verification
  const totalParadiseShows = await Show.countDocuments({ movie: movie._id, isActive: true });
  console.log(`Verified total shows for "The Paradise": ${totalParadiseShows}`);

  await mongoose.disconnect();
}

addNaniParadise().catch(err => {
  console.error('Error adding Nani Paradise:', err);
  process.exit(1);
});
