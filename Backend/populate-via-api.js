/**
 * Populate database by calling REST APIs (no embedded DB writes).
 * Usage: node populate-via-api.js [adminEmail] [adminPassword]
 * Env: API_URL (default http://localhost:4000)
 */
require('dotenv').config();

const API = process.env.API_URL || 'http://localhost:4000';

const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.argv[3] || process.env.ADMIN_PASSWORD;

if (!password) {
  console.error('Error: Please provide admin password as an argument or set ADMIN_PASSWORD in your .env file.');
  console.error('Usage: node populate-via-api.js [adminEmail] [adminPassword]');
  process.exit(1);
}

async function request(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `${method} ${path} failed (${res.status})`);
  }
  return data;
}

const MOVIES = [
  {
    title: 'Inception',
    description:
      'A thief who steals corporate secrets through dream-sharing technology is offered a chance to have his criminal record erased.',
    duration: 148,
    language: 'English',
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    releaseDate: '2010-07-16',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rating: 8.8,
  },
  {
    title: 'Interstellar',
    description:
      'Explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    duration: 169,
    language: 'English',
    genre: ['Sci-Fi', 'Drama', 'Adventure'],
    releaseDate: '2014-11-07',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.7,
  },
  {
    title: 'Oppenheimer',
    description: 'The story of J. Robert Oppenheimer and the atomic bomb.',
    duration: 180,
    language: 'English',
    genre: ['Biography', 'Drama', 'History'],
    releaseDate: '2023-07-21',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    rating: 8.5,
  },
  {
    title: 'Jawan',
    description: 'A man sets out to rectify the wrongs in society.',
    duration: 169,
    language: 'Hindi',
    genre: ['Action', 'Thriller', 'Drama'],
    releaseDate: '2023-09-07',
    posterUrl: 'https://image.tmdb.org/t/p/w500/veoSznKfOGdTpi8co02sfE63pH7.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=COql98BCZNE',
    rating: 7.8,
  },
  {
    title: 'RRR',
    description: 'Two revolutionaries fight against British rule in the 1920s.',
    duration: 187,
    language: 'Telugu',
    genre: ['Action', 'Drama', 'Period'],
    releaseDate: '2022-03-25',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQW8ZMgw8spdS.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJxLWlc',
    rating: 8.0,
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with the Fremen on Arrakis.',
    duration: 166,
    language: 'English',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    releaseDate: '2024-03-01',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlRXjGMhXt6nZNB.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    rating: 8.6,
  },
];

const THEATRES = [
  {
    name: 'PVR ICON Phoenix',
    city: 'Mumbai',
    address: 'Phoenix Marketcity, LBS Marg, Kurla West',
    description: 'Premium multiplex with IMAX.',
    facilities: ['IMAX', '4DX', 'Recliner'],
  },
  {
    name: 'INOX Megaplex',
    city: 'Mumbai',
    address: 'R City Mall, Ghatkopar West',
    description: 'Dolby Atmos screens.',
    facilities: ['Dolby Atmos', 'Recliner'],
  },
  {
    name: 'PVR Select Citywalk',
    city: 'Delhi',
    address: 'Select Citywalk, Saket',
    description: 'Flagship PVR in Delhi.',
    facilities: ['IMAX', 'Gold Class'],
  },
  {
    name: 'Cinepolis Orion',
    city: 'Bangalore',
    address: 'Orion Mall, Malleshwaram',
    description: 'Luxury seating.',
    facilities: ['MacroXE', 'Recliner'],
  },
];

const SCREEN_TEMPLATES = [
  { name: 'Screen 1 — IMAX', screenType: 'IMAX', rows: 10, cols: 14 },
  { name: 'Screen 2 — 3D', screenType: '3D', rows: 8, cols: 12 },
  { name: 'Screen 3 — Standard', screenType: '2D', rows: 8, cols: 10 },
];

const SHOW_TIMES = ['10:30', '13:45', '17:00', '20:15'];

function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number);
  const end = new Date();
  end.setHours(h + hours, m, 0, 0);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

function upcomingDates(count = 5) {
  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setUTCHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString());
  }
  return dates;
}

async function main() {
  console.log(`API: ${API}`);
  console.log(`Login: ${email}`);

  const login = await request('POST', '/auth/login', { email, password });
  const token = login.token;
  if (!token) throw new Error('No token returned — check admin email/password');
  console.log('Logged in as admin\n');

  const theatres = [];
  for (const t of THEATRES) {
    const res = await request('POST', '/theatres/add', t, token);
    theatres.push(res.theatre);
    console.log(`Theatre: ${res.theatre.name} (${res.theatre.city})`);
  }

  const screensByTheatre = {};
  for (const theatre of theatres) {
    screensByTheatre[theatre._id] = [];
    for (const tmpl of SCREEN_TEMPLATES) {
      const res = await request(
        'POST',
        '/screens/add',
        {
          theatre: theatre._id,
          name: tmpl.name,
          screenType: tmpl.screenType,
          totalSeats: tmpl.rows * tmpl.cols,
          seatLayout: { rows: tmpl.rows, cols: tmpl.cols },
        },
        token
      );
      screensByTheatre[theatre._id].push(res.screen);
      console.log(`  Screen: ${tmpl.name}`);
    }
  }

  const movies = [];
  for (const m of MOVIES) {
    const res = await request('POST', '/movies/add', m, token);
    movies.push(res.movie);
    console.log(`Movie: ${res.movie.title}`);
  }

  const dates = upcomingDates(5);
  let showCount = 0;
  const mumbai = theatres.filter((t) => t.city === 'Mumbai');

  for (const movie of movies) {
    for (const theatre of mumbai) {
      const screens = screensByTheatre[theatre._id];
      for (const date of dates) {
        for (let i = 0; i < SHOW_TIMES.length; i++) {
          const screen = screens[i % screens.length];
          const startTime = SHOW_TIMES[i];
          const price = screen.screenType === 'IMAX' ? 450 : screen.screenType === '3D' ? 350 : 250;
          await request(
            'POST',
            '/shows/add',
            {
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate: date,
              startTime,
              endTime: addHours(startTime, 3),
              ticketPrice: price,
            },
            token
          );
          showCount++;
        }
      }
    }
  }

  for (const movie of movies.slice(0, 3)) {
    for (const theatre of theatres.filter((t) => t.city !== 'Mumbai')) {
      const screen = screensByTheatre[theatre._id][0];
      for (const date of dates.slice(0, 3)) {
        for (const startTime of ['14:00', '18:30', '21:45']) {
          await request(
            'POST',
            '/shows/add',
            {
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate: date,
              startTime,
              endTime: addHours(startTime, 3),
              ticketPrice: 300,
            },
            token
          );
          showCount++;
        }
      }
    }
  }

  console.log(`\nDone. Created ${showCount} shows via API.`);
  console.log('Set city to Mumbai on the website to browse showtimes.');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  console.error('Tip: node populate-via-api.js your-admin@email.com yourpassword');
  process.exit(1);
});
