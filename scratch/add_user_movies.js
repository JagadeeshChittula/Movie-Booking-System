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

const moviesToEnsure = [
  {
    title: 'Fauzi',
    language: 'Telugu',
    genre: ['Period', 'Action', 'Drama'],
    description: 'High-budget periodic action drama set in the 1940s starring Prabhas and directed by Hanu Raghavapudi, following a brave Indian soldier fighting for national honor and true love.',
    duration: 165,
    releaseDate: '2026-08-14',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 9.3
  },
  {
    title: 'Jailer 2',
    language: 'Tamil',
    genre: ['Action', 'Thriller'],
    description: 'Mega action-thriller sequel directed by Nelson Dilipkumar starring Superstar Rajinikanth as Tiger Muthuvel Pandian battling a ruthless international criminal syndicate.',
    duration: 168,
    releaseDate: '2026-06-12',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 9.2
  },
  {
    title: 'Sigma',
    language: 'Telugu',
    genre: ['Action', 'Comedy'],
    description: 'Action-comedy entertainer featuring high-octane stunts, sharp wit, clever undercover schemes, and non-stop laughs.',
    duration: 145,
    releaseDate: '2026-04-10',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.7
  },
  {
    title: 'Ranabaali',
    language: 'Telugu',
    genre: ['Action', 'Drama', 'Mass'],
    description: 'Mass action entertainer following an unstoppable warrior who stands up against an oppressive regime to reclaim dignity for his soil.',
    duration: 152,
    releaseDate: '2026-05-01',
    posterUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.8
  },
  {
    title: 'OM: Chapter 1 – Udhiram',
    language: 'Tamil',
    genre: ['Action', 'Drama'],
    description: 'Gritty action drama diving into the ruthless underbelly of crime, vengeance, unyielding loyalty, and bloody confrontations.',
    duration: 150,
    releaseDate: '2026-07-24',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.9
  },
  {
    title: 'Scene',
    language: 'Tamil',
    genre: ['Action', 'Thriller'],
    description: 'High-octane action film detailing an intense cat-and-mouse game between elite investigative specialists and a master manipulator.',
    duration: 142,
    releaseDate: '2026-05-15',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.6
  },
  {
    title: 'Vishwambhara',
    language: 'Telugu',
    genre: ['Fantasy', 'Action', 'Epic'],
    description: 'Large-scale socio-fantasy epic starring Megastar Chiranjeevi on a breathtaking mythical voyage through ancient cosmic worlds.',
    duration: 170,
    releaseDate: '2026-01-10',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 9.4
  },
  {
    title: 'Ramayana',
    language: 'Telugu',
    genre: ['Mythological', 'Epic', 'Drama'],
    description: 'Grand Pan-India mythological epic chronicling Lord Rama\'s exile, steadfast virtue, and monumental triumph over evil forces.',
    duration: 180,
    releaseDate: '2026-11-06',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 9.5
  },
  {
    title: 'Mookuthi Amman 2',
    language: 'Tamil',
    genre: ['Fantasy', 'Comedy'],
    description: 'Fantasy-comedy sequel where goddess Mookuthi Amman descends once again with divine humor to expose modern hypocrisy and bless true devotion.',
    duration: 138,
    releaseDate: '2026-04-14',
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.5
  },
  {
    title: 'Aadarsha Kutumbam House No: 47',
    language: 'Telugu',
    genre: ['Family', 'Drama'],
    description: 'Heartwarming family drama portraying the sweet quirks, generational traditions, sacrifices, and unconditional love inside house no. 47.',
    duration: 140,
    releaseDate: '2026-03-27',
    posterUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.7
  },
  {
    title: 'Itllu Arjuna',
    language: 'Telugu',
    genre: ['Romance', 'Drama'],
    description: 'Romantic drama telling the moving tale of Arjuna, navigating youthful ambitions, bittersweet heartbreak, and the courage to love again.',
    duration: 144,
    releaseDate: '2026-02-14',
    posterUrl: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.6
  },
  {
    title: 'Rupayanamaha',
    language: 'Telugu',
    genre: ['Drama'],
    description: 'Realistic drama exploring the immense influence of money on human psychology, friendships, ethics, and destiny in modern society.',
    duration: 136,
    releaseDate: '2026-04-03',
    posterUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 8.5
  },
  {
    title: 'Comrade Kalyan',
    language: 'Telugu',
    genre: ['Political', 'Social', 'Drama'],
    description: 'Powerful political and social drama focusing on student activism, grassroots rebellion, and a young leader\'s struggle for public welfare.',
    duration: 155,
    releaseDate: '2026-05-29',
    posterUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 9.0
  },
  {
    title: 'King 100',
    language: 'Telugu',
    genre: ['Period', 'Drama', 'Action'],
    description: 'Periodic milestone drama marking Akkineni Nagarjuna\'s landmark 100th feature film, celebrating valor, imperial legacy, and timeless charisma.',
    duration: 165,
    releaseDate: '2026-08-28',
    posterUrl: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=500&auto=format&fit=crop&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    rating: 9.3
  }
];

async function addOrUpdateMovie(movieData) {
  // Call POST /movies/add via HTTP
  const res = await fetch(`${BASE_URL}/movies/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(movieData)
  });

  const body = await res.json();
  if (res.status === 201) {
    console.log(`[API POST /movies/add SUCCESS] Created movie: "${body.movie.title}" [id: ${body.movie._id}]`);
    return body.movie;
  } else if (res.status === 409 && body.movie) {
    // Already exists in DB - update details if needed via PUT
    console.log(`[API POST /movies/add 409] Already exists: "${body.movie.title}" [id: ${body.movie._id}]. Updating details...`);
    const updateRes = await fetch(`${BASE_URL}/movies/update/${body.movie._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(movieData)
    });
    const updateBody = await updateRes.json();
    return updateBody.movie || body.movie;
  } else {
    console.error(`[API ERROR] status ${res.status}:`, body);
    return null;
  }
}

async function run() {
  console.log('--- Step 1: Processing Movies via REST API ---');
  const resolvedMovies = [];
  for (const m of moviesToEnsure) {
    const movieObj = await addOrUpdateMovie(m);
    if (movieObj) resolvedMovies.push(movieObj);
  }

  console.log(`\nSuccessfully ensured ${resolvedMovies.length} movies via REST API.`);

  // Connect to DB directly to inspect free slots and schedule shows via API
  await mongoose.connect(URI);
  const Theatre = mongoose.model('Theatre', new mongoose.Schema({ name: String, city: String, isActive: Boolean }));
  const Screen = mongoose.model('Screen', new mongoose.Schema({ name: String, theatre: mongoose.Schema.Types.ObjectId, isActive: Boolean, totalSeats: Number }));
  const Show = mongoose.model('Show', new mongoose.Schema({ theatre: mongoose.Schema.Types.ObjectId, screen: mongoose.Schema.Types.ObjectId, showDate: Date, startTime: String, isActive: Boolean }));

  // Find theatres in key cities: Srikakulam, Visakhapatnam, Vijayawada, Chennai, Hyderabad
  const cities = ['Srikakulam', 'Visakhapatnam', 'Vijayawada', 'Chennai', 'Hyderabad'];
  const theatres = await Theatre.find({ city: { $in: cities }, isActive: { $ne: false } });
  console.log(`\nFound ${theatres.length} active theatres across ${cities.join(', ')}.`);

  // Standard show time slots
  const standardSlots = [
    { start: '10:30 AM', end: '01:30 PM' },
    { start: '02:00 PM', end: '05:00 PM' },
    { start: '06:00 PM', end: '09:00 PM' },
    { start: '09:30 PM', end: '12:30 AM' }
  ];

  // Target dates: next 5 days
  const targetDates = [
    '2026-09-24',
    '2026-09-25',
    '2026-09-26',
    '2026-09-27',
    '2026-09-28'
  ];

  console.log('\n--- Step 2: Scheduling shows via POST /shows/add for new & updated movies ---');

  let showsScheduled = 0;
  for (const t of theatres) {
    const screens = await Screen.find({ theatre: t._id, isActive: { $ne: false } });
    if (screens.length === 0) continue;

    for (const screen of screens) {
      for (const dateStr of targetDates) {
        const startOfDay = new Date(dateStr);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // Check occupied slots on this screen
        const existingShowsOnScreen = await Show.find({
          screen: screen._id,
          showDate: { $gte: startOfDay, $lte: endOfDay },
          isActive: true
        });
        const occupiedTimes = new Set(existingShowsOnScreen.map(s => s.startTime.trim()));

        // Find available slots
        const freeSlots = standardSlots.filter(s => !occupiedTimes.has(s.start));

        for (const slot of freeSlots) {
          // Pick a movie from our list that fits this city / language
          const matchingMovies = resolvedMovies.filter(m => {
            if (t.city === 'Chennai') return m.language === 'Tamil' || m.language?.includes('Tamil');
            return m.language === 'Telugu' || m.language?.includes('Telugu') || m.language === 'Pan-India';
          });
          const pool = matchingMovies.length > 0 ? matchingMovies : resolvedMovies;
          const chosenMovie = pool[(showsScheduled + freeSlots.indexOf(slot)) % pool.length];

          // Schedule show via POST /shows/add
          const showPayload = {
            movie: chosenMovie._id,
            theatre: t._id,
            screen: screen._id,
            showDate: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            ticketPrice: t.city === 'Chennai' || t.city === 'Hyderabad' ? 200 : 150
          };

          const addRes = await fetch(`${BASE_URL}/shows/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(showPayload)
          });

          if (addRes.status === 201) {
            showsScheduled++;
            if (showsScheduled % 15 === 0) {
              console.log(`[API POST /shows/add] Scheduled ${showsScheduled} shows... (latest: "${chosenMovie.title}" at ${t.name}, ${t.city} on ${dateStr} ${slot.start})`);
            }
          }
        }
      }
    }
  }

  console.log(`\n🎉 Successfully scheduled ${showsScheduled} new shows via REST API without collisions!`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
