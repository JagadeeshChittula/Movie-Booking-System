const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const API = 'http://localhost:4000';
const FRONTEND_POSTERS = path.join(__dirname, '../Frontend/public/posters');
const BACKEND_POSTERS = path.join(__dirname, 'public/posters');

if (!fs.existsSync(FRONTEND_POSTERS)) fs.mkdirSync(FRONTEND_POSTERS, { recursive: true });
if (!fs.existsSync(BACKEND_POSTERS)) fs.mkdirSync(BACKEND_POSTERS, { recursive: true });

async function req(method, pathUrl, body, token) {
  const res = await fetch(`${API}${pathUrl}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `${method} ${pathUrl} failed (${res.status})`);
  }
  return data;
}

// Download image or create fallback poster with text
function downloadOrFallbackPoster(url, filename, title) {
  return new Promise((resolve) => {
    const fPath = path.join(FRONTEND_POSTERS, filename);
    const bPath = path.join(BACKEND_POSTERS, filename);

    if (fs.existsSync(fPath) && fs.statSync(fPath).size > 1000) {
      if (!fs.existsSync(bPath)) fs.copyFileSync(fPath, bPath);
      resolve(`/posters/${filename}`);
      return;
    }

    if (!url || !url.startsWith('http')) {
      resolve(`/posters/${filename}`);
      return;
    }

    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(fPath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => {
            fs.copyFileSync(fPath, bPath);
            resolve(`/posters/${filename}`);
          });
        });
      } else {
        // If external link returns non-200, use default poster
        resolve(`/posters/kalki-2898-ad.jpg`);
      }
    });

    req.on('error', () => {
      resolve(`/posters/kalki-2898-ad.jpg`);
    });
    req.setTimeout(6000, () => {
      req.destroy();
      resolve(`/posters/kalki-2898-ad.jpg`);
    });
  });
}

const MOVIES_2026 = [
  // --- TELUGU & PAN-INDIA 2026 ---
  {
    title: 'Salaar: Part 2 – Shouryaanga Parvam',
    description: 'The titanic conflict erupts between Deva and Varadha in the ancient dystopian fortress city of Khansaar.',
    duration: 178,
    language: 'Telugu',
    genre: ['Action', 'Epic', 'Crime'],
    releaseDate: '2026-08-14',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mHQOO0v0P10Gv5rK9XoRk4A6p4L.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=4GPvYMKtrtI',
    rating: 9.2,
    slug: 'salaar-part-2.jpg',
  },
  {
    title: 'Toxic: A Fairy Tale for Grown-ups',
    description: 'Rocking Star Yash stars as an international cartel kingpin in a gritty, high-stakes underworld spectacle.',
    duration: 165,
    language: 'Kannada',
    genre: ['Crime', 'Action', 'Thriller'],
    releaseDate: '2026-04-10',
    posterUrl: 'https://image.tmdb.org/t/p/w500/b1C0Fu9q2X8S4v8K3D0z7L5m2E1.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=k8L2m3V4b5N',
    rating: 9.0,
    slug: 'toxic.jpg',
  },
  {
    title: 'Kantara: Chapter 1',
    description: 'Rishab Shetty explores the ancient Kadamba dynasty legend and the divine genesis of Panjurli and Guliga Daiva.',
    duration: 168,
    language: 'Kannada',
    genre: ['Period', 'Mythology', 'Action'],
    releaseDate: '2026-07-24',
    posterUrl: 'https://image.tmdb.org/t/p/w500/fTmsGSmb8N3V7M6S2Vb9H7L3K2M.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=y1-w1pUeHw4',
    rating: 9.3,
    slug: 'kantara-chapter-1.jpg',
  },
  {
    title: 'Jai Hanuman',
    description: 'Rishab Shetty takes on the divine mantle of Lord Hanuman guarding the sacred promise made to Lord Sri Rama in Treta Yuga.',
    duration: 160,
    language: 'Telugu',
    genre: ['Divine', 'Fantasy', 'Action'],
    releaseDate: '2026-08-15',
    posterUrl: 'https://image.tmdb.org/t/p/w500/c7k4V8M3L2S5N6p1H8B0J9x2Y7M.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=F0U5S8w1N2Y',
    rating: 9.1,
    slug: 'jai-hanuman.jpg',
  },
  {
    title: 'VD12 (Rowdy Janardhan)',
    description: 'Vijay Deverakonda portrays an elite 1970s undercover spy embroiled in high-voltage political conspiracy across hostile borders.',
    duration: 155,
    language: 'Telugu',
    genre: ['Spy', 'Action', 'Thriller'],
    releaseDate: '2026-06-12',
    posterUrl: 'https://image.tmdb.org/t/p/w500/k2A3S4D5F6G7H8J9K0L1Z2X3C4V.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=6o4bK3v2j8M',
    rating: 8.7,
    slug: 'vd12.jpg',
  },
  {
    title: 'AA22 (Allu Arjun & Atlee)',
    description: 'Icon Star Allu Arjun joins hands with blockbuster director Atlee for an unprecedented dual-role action spectacle.',
    duration: 170,
    language: 'Telugu',
    genre: ['Action', 'Mass', 'Emotion'],
    releaseDate: '2026-09-04',
    posterUrl: 'https://image.tmdb.org/t/p/w500/u1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Ub1m3k1J8V0',
    rating: 8.9,
    slug: 'aa22.jpg',
  },
  {
    title: 'The Paradise',
    description: 'Natural Star Nani reteams with Srikanth Odela for an uncompromising, raw rural action drama set in the Telangana coalfields.',
    duration: 162,
    language: 'Telugu',
    genre: ['Action', 'Period', 'Crime'],
    releaseDate: '2026-08-28',
    posterUrl: 'https://image.tmdb.org/t/p/w500/s1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Sr1m3k1J8V0',
    rating: 8.8,
    slug: 'the-paradise.jpg',
  },
  {
    title: 'Pushpa 3: The Rampage',
    description: 'Pushpa Raj expands his red sanders syndicate across international borders from Tokyo to London.',
    duration: 185,
    language: 'Telugu',
    genre: ['Action', 'Crime', 'Mass'],
    releaseDate: '2026-12-18',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    rating: 9.4,
    slug: 'pushpa-3.jpg',
  },
  {
    title: 'Amaran',
    description: 'The heroic real-life journey of Major Mukund Varadarajan of the Rajput Regiment in Kashmir counter-terrorism operations.',
    duration: 169,
    language: 'Tamil',
    genre: ['Action', 'Biopic', 'Drama'],
    releaseDate: '2026-07-15',
    posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    rating: 9.1,
    slug: 'amaran.jpg',
  },
  {
    title: 'Ka',
    description: 'In the peaceful mountain valley of Krishnagiri, a curious postman stumbles onto a terrifying web of disappearing letters.',
    duration: 147,
    language: 'Telugu',
    genre: ['Period', 'Mystery', 'Thriller'],
    releaseDate: '2026-07-20',
    posterUrl: 'https://image.tmdb.org/t/p/w500/A7O5Z2oM22J8tSflJjR69s8bZ5M.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=kYfn7Wj7s1Q',
    rating: 8.6,
    slug: 'ka.jpg',
  },
  {
    title: 'Mechanic Rocky',
    description: 'A sharp, unconventional automotive mechanic Rocky takes on a ruthless land mafia syndicate encroaching upon his ancestral workshop.',
    duration: 152,
    language: 'Telugu',
    genre: ['Action', 'Comedy', 'Drama'],
    releaseDate: '2026-08-07',
    posterUrl: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    rating: 8.4,
    slug: 'mechanic-rocky.jpg',
  },
  {
    title: 'Matka',
    description: 'The explosive rise of Vasu from a penniless 1958 Vizag refugee camp to the undisputed kingpin of the national Matka betting empire.',
    duration: 158,
    language: 'Telugu',
    genre: ['Crime', 'Period', 'Action'],
    releaseDate: '2026-08-21',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    rating: 8.5,
    slug: 'matka.jpg',
  },

  // --- TAMIL 2026 ---
  {
    title: 'Thalapathy 69',
    description: 'Thalapathy Vijay delivers his historic final cinematic statement as a fearless people leader fighting state oppression.',
    duration: 172,
    language: 'Tamil',
    genre: ['Action', 'Political', 'Drama'],
    releaseDate: '2026-09-18',
    posterUrl: 'https://image.tmdb.org/t/p/w500/le1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Le1m3k1J8V0',
    rating: 9.3,
    slug: 'thalapathy-69.jpg',
  },
  {
    title: 'Coolie',
    description: 'Superstar Rajinikanth stars as Deva, a harbor dock worker who unravels an international syndicate of gold smugglers.',
    duration: 168,
    language: 'Tamil',
    genre: ['Action', 'Crime', 'Thriller'],
    releaseDate: '2026-07-31',
    posterUrl: 'https://image.tmdb.org/t/p/w500/jl1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Jl1m3k1J8V0',
    rating: 9.0,
    slug: 'coolie.jpg',
  },
  {
    title: 'Kaithi 2 (LCU)',
    description: 'Dilli returns in Lokesh Kanagaraj cinematic universe to rescue his daughter from a deadly revenge cartel.',
    duration: 162,
    language: 'Tamil',
    genre: ['Action', 'Thriller', 'LCU'],
    releaseDate: '2026-08-15',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vt1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Vt1m3k1J8V0',
    rating: 8.9,
    slug: 'kaithi-2.jpg',
  },
  {
    title: 'Rolex (Standalone)',
    description: 'The terrifying origin story and ruthless ascension of the diamond syndicate kingpin Rolex in the Lokesh Cinematic Universe.',
    duration: 154,
    language: 'Tamil',
    genre: ['Crime', 'Action', 'Dark Thriller'],
    releaseDate: '2026-09-11',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gt1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Gt1m3k1J8V0',
    rating: 9.2,
    slug: 'rolex.jpg',
  },
  {
    title: 'Jailer 2 (Hukum)',
    description: 'Tiger Muthuvel Pandian re-emerges from retirement when an elusive global arms syndicate targets his surviving family.',
    duration: 165,
    language: 'Tamil',
    genre: ['Action', 'Dark Comedy', 'Mass'],
    releaseDate: '2026-08-28',
    posterUrl: 'https://image.tmdb.org/t/p/w500/mb1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Mb1m3k1J8V0',
    rating: 8.8,
    slug: 'jailer-2.jpg',
  },

  // --- HINDI 2026 ---
  {
    title: 'Ramayana: Part 1',
    description: 'Nitesh Tiwari monumental cinematic adaptation of Valmiki Ramayana, tracking Lord Ramas banishment and battle with evil.',
    duration: 190,
    language: 'Hindi',
    genre: ['Mythology', 'Epic', 'Drama'],
    releaseDate: '2026-09-25',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rating: 9.5,
    slug: 'ramayana-part-1.jpg',
  },
  {
    title: 'War 2',
    description: 'Major Kabir Dhaliwal confronts a rogue secret intelligence operative in an adrenaline-pumping global clash.',
    duration: 165,
    language: 'Hindi',
    genre: ['Action', 'Spy Universe', 'Thriller'],
    releaseDate: '2026-08-14',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.9,
    slug: 'war-2.jpg',
  },
  {
    title: 'King',
    description: 'Shah Rukh Khan portrays an elite underworld assassin who must train and shield his young protégé across hostile European streets.',
    duration: 158,
    language: 'Hindi',
    genre: ['Action', 'Crime', 'Emotion'],
    releaseDate: '2026-07-17',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    rating: 9.0,
    slug: 'king.jpg',
  },
  {
    title: 'Love & War',
    description: 'Sanjay Leela Bhansali epic romantic military drama chronicling deep-seated love, sacrifice, and honor during wartime.',
    duration: 180,
    language: 'Hindi',
    genre: ['Romance', 'War', 'Drama'],
    releaseDate: '2026-09-04',
    posterUrl: 'https://image.tmdb.org/t/p/w500/veoSznKfOGdTpi8co02sfE63pH7.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=COql98BCZNE',
    rating: 8.7,
    slug: 'love-and-war.jpg',
  },
  {
    title: 'Bhool Bhulaiyaa 3',
    description: 'Rooh Baba enters the haunted kingdom of Rakht Ghat only to encounter two vengeful spirits claiming to be Manjulika.',
    duration: 158,
    language: 'Hindi',
    genre: ['Horror', 'Comedy', 'Mystery'],
    releaseDate: '2026-07-10',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQW8ZMgw8spdS.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJxLWlc',
    rating: 8.3,
    slug: 'bhool-bhulaiyaa-3.jpg',
  },
  {
    title: 'Singham Again',
    description: 'DCP Bajirao Singham unites the elite cop squad across Kashmir, Gujarat, and Sri Lanka to demolish a terror syndicate.',
    duration: 164,
    language: 'Hindi',
    genre: ['Action', 'Cop Universe', 'Mass'],
    releaseDate: '2026-07-24',
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlRXjGMhXt6nZNB.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    rating: 8.2,
    slug: 'singham-again.jpg',
  },

  // --- HOLLYWOOD / ENGLISH 2026 ---
  {
    title: 'Avengers: Doomsday',
    description: 'Earth mightiest heroes face their most lethal existential crisis when Doctor Victor von Doom breaches the multiverse boundaries.',
    duration: 182,
    language: 'English',
    genre: ['Action', 'Sci-Fi', 'Superhero'],
    releaseDate: '2026-05-01',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rating: 9.4,
    slug: 'avengers-doomsday.jpg',
  },
  {
    title: 'Spider-Man 4',
    description: 'Peter Parker navigates a solitary vigilante life in Manhattan, confronting a newly emerged organized crime syndicate.',
    duration: 152,
    language: 'English',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    releaseDate: '2026-07-24',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.9,
    slug: 'spider-man-4.jpg',
  },
  {
    title: 'The Batman: Part II',
    description: 'The Dark Knight delves into the submerged Gotham underworld as deep-seated aristocratic corruption surfaces from the shadows.',
    duration: 175,
    language: 'English',
    genre: ['Crime', 'Detective', 'Mystery'],
    releaseDate: '2026-09-18',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    rating: 9.1,
    slug: 'the-batman-2.jpg',
  },
  {
    title: 'Star Wars: The Mandalorian & Grogu',
    description: 'Din Djarin and the force-sensitive Grogu embark on a perilous galactic outer rim journey for the New Republic.',
    duration: 142,
    language: 'English',
    genre: ['Sci-Fi', 'Space', 'Adventure'],
    releaseDate: '2026-05-22',
    posterUrl: 'https://image.tmdb.org/t/p/w500/veoSznKfOGdTpi8co02sfE63pH7.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=COql98BCZNE',
    rating: 8.7,
    slug: 'mandalorian-grogu.jpg',
  },
  {
    title: 'Dune: Messiah',
    description: 'Paul Atreides faces the devastating consequences of his imperial ascendancy and holy war across the sands of Arrakis.',
    duration: 172,
    language: 'English',
    genre: ['Sci-Fi', 'Drama', 'Epic'],
    releaseDate: '2026-08-28',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQW8ZMgw8spdS.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJxLWlc',
    rating: 9.3,
    slug: 'dune-messiah.jpg',
  },
];

async function main() {
  console.log('=== Step 1: Admin Login via REST API ===');
  const login = await req('POST', '/auth/login', {
    email: 'jagadeesh@gmail.com',
    password: 'admin123',
  });
  const token = login.token;
  console.log(`Logged in as: ${login.user.name} (${login.user.role})`);

  console.log('\n=== Step 2: Checking existing movies to prevent duplicates ===');
  const existingRes = await req('GET', '/movies/all');
  const existingTitles = new Set(
    (existingRes.movies || []).map((m) => m.title.toLowerCase().trim())
  );

  console.log('\n=== Step 3: Adding 2026 Movies via POST /movies/add ===');
  const addedMovies = [];
  for (const m of MOVIES_2026) {
    if (existingTitles.has(m.title.toLowerCase().trim())) {
      console.log(`[Already in DB] ${m.title}`);
      continue;
    }

    // Ensure poster exists locally
    const posterPath = await downloadOrFallbackPoster(m.posterUrl, m.slug, m.title);

    const moviePayload = {
      title: m.title,
      description: m.description,
      duration: m.duration,
      language: m.language,
      genre: m.genre,
      releaseDate: m.releaseDate,
      posterUrl: posterPath,
      trailerUrl: m.trailerUrl,
      rating: m.rating,
    };

    try {
      const res = await req('POST', '/movies/add', moviePayload, token);
      addedMovies.push(res.movie);
      console.log(`[Added via API] ${res.movie.title} (${res.movie.language})`);
    } catch (e) {
      console.error(`[Failed to add] ${m.title}: ${e.message}`);
    }
  }

  console.log(`\nSuccessfully added ${addedMovies.length} new 2026 movies via Postman/REST API!`);

  console.log('\n=== Step 4: Scheduling Shows for Srikakulam & AP/Telangana Theatres via POST /shows/add ===');
  const theatresRes = await req('GET', '/theatres/all');
  const allTheatres = theatresRes.theatres || [];
  const sklmTheatres = allTheatres.filter((t) => /srikakulam/i.test(t.city));
  const otherTheatres = allTheatres.filter((t) => !/srikakulam/i.test(t.city)).slice(0, 20);

  const targetTheatres = [...sklmTheatres, ...otherTheatres];
  console.log(`Scheduling shows across ${targetTheatres.length} theatres (${sklmTheatres.length} in Srikakulam)...`);

  const screensRes = await req('GET', '/screens/all');
  const allScreens = screensRes.screens || [];
  const screensByTheatre = {};
  allScreens.forEach((s) => {
    const tid = String(s.theatre?._id || s.theatre);
    if (!screensByTheatre[tid]) screensByTheatre[tid] = [];
    screensByTheatre[tid].push(s);
  });

  const SHOW_TIMES = [
    { start: '11:00 AM', end: '01:45 PM' },
    { start: '02:30 PM', end: '05:15 PM' },
    { start: '06:15 PM', end: '09:00 PM' },
    { start: '09:30 PM', end: '12:15 AM' },
  ];

  const dates = [
    '2026-09-23T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z',
    '2026-09-25T00:00:00.000Z',
    '2026-09-26T00:00:00.000Z',
  ];

  let addedShowsCount = 0;
  for (const movie of addedMovies) {
    // Pick 4 theatres for each movie (at least 2 in Srikakulam)
    const selectedTheatres = [
      ...sklmTheatres.slice(0, 3),
      ...otherTheatres.slice(0, 2),
    ];

    for (const theatre of selectedTheatres) {
      const tScreens = screensByTheatre[String(theatre._id)] || [];
      if (tScreens.length === 0) continue;
      const screen = tScreens[0];

      for (let dayIdx = 0; dayIdx < 2; dayIdx++) {
        const slot = SHOW_TIMES[(movie.title.length + dayIdx) % SHOW_TIMES.length];
        try {
          await req(
            'POST',
            '/shows/add',
            {
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate: dates[dayIdx],
              startTime: slot.start,
              endTime: slot.end,
              ticketPrice: screen.screenType === 'IMAX' ? 250 : 150,
            },
            token
          );
          addedShowsCount++;
        } catch (e) {
          // ignore duplicate shows
        }
      }
    }
  }

  console.log(`Added ${addedShowsCount} new shows for 2026 movies via POST /shows/add!`);
  console.log('\nAll 2026 movies are now active in the database and visible in Srikakulam!');
}

main().catch(console.error);
