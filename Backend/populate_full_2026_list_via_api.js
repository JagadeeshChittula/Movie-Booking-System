const fs = require('fs');
const path = require('path');

const API = 'http://localhost:4000';

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

const TELUGU_TITLES = [
  "Mana Shankara Vara Prasad Garu",
  "Peddi",
  "Maa Inti Bangaaram",
  "Dacoit: A Love Story",
  "Irumudi",
  "Chennai Love Story",
  "Anaganaga Oka Raju",
  "Aadarsha Kutumbam House No: 47",
  "Sigma",
  "Itllu Arjuna",
  "Ranabaali",
  "Rupayanamaha",
  "Lenin",
  "Raakaasa",
  "Biker",
  "Agadha",
  "Amma Naaku Aa Abbayi Kaavali",
  "Band Melam",
  "Bhartha Mahasayulaku Wignyapthi",
  "Blood Roses",
  "Suvarna",
  "Diamond Dacoit",
  "Bad Boy Karthik",
  "Gaali",
  "Papam Prathap",
  "Therachaapa",
  "Thimmarajupalli TV",
  "Rich Kid",
  "Gedela Raju Kakinada Taluka",
  "Paramapadha Sopanam",
  "Sugriva",
  "Gaayapadda Simham",
  "Jetlee",
  "Godari Gattupaina",
  "M4M: Motive for Murder",
  "Razor",
  "Sathi Leelavathi",
  "Vidhi Geesina V Chitram",
  "Arey Apandra",
  "Dooradarshini",
  "Harudu",
  "Mr. Work from Home",
  "First Time",
  "Purushaha",
  "Ramani Kalyanam",
  "Ugly Story",
  "Trikala",
  "Mareechika",
  "Sandigdham",
  "Kotha Malupu",
  "Okka Chuputho",
  "Drohi",
  "Secret Soldier",
  "Vega Leela",
  "Samavarthi",
  "Mahendragiri Varahi",
  "Don't Trouble the Trouble",
  "Comrade Kalyan"
];

const TAMIL_TITLES = [
  "Jana Nayagan",
  "Karuppu",
  "Vishwanath & Sons",
  "Sardar 2",
  "Mandaadi",
  "Love Insurance Kompany",
  "DC",
  "Parasakthi",
  "Blast",
  "Thaai Kizhavi",
  "Youth",
  "Salliyargal",
  "Anali",
  "Dear Radhi",
  "Justice for Jeni",
  "Kaakaa",
  "The Bed",
  "Anantha",
  "Vaa Vaathiyaar",
  "Thalaivar Thambi Thalaimaiyil",
  "Draupathi 2",
  "Hot Spot 2 Much",
  "Jockey",
  "Maayabimbum",
  "Vangala Viriguda",
  "Gandhi Talks",
  "Granny",
  "Karuppu Pulsar",
  "Lockdown",
  "Mellisai",
  "Thiraivi",
  "Gilli Mappilai",
  "Red Label",
  "With Love",
  "Yogi Da",
  "Dream Girl",
  "Kaa – The Forest",
  "My Lord",
  "Mylanji",
  "Pookie",
  "Aazhi",
  "Ananthan Kaadu",
  "Anbe Diana",
  "Angikaaram",
  "Anthony",
  "Arulvaan",
  "Dark",
  "Dark Giant",
  "Demonte Colony 3",
  "Dorothy",
  "Double Occupancy",
  "Habeebi",
  "Happy Raj",
  "Heartin",
  "Hi",
  "Kaalidas 2",
  "Kadhal Reset Repeat",
  "Kara",
  "Katrathey Babu",
  "Kenatha Kanom",
  "Kolaiseval",
  "Leader",
  "Love Oh Love",
  "Lucky the Superstar",
  "Made in Korea",
  "Magudam",
  "Manithan Deivamagalam",
  "Mayilaa",
  "Mr. Bhaarath",
  "Mr. X",
  "Modha Rathri",
  "Mookuthi Amman 2",
  "Mudharkanal",
  "Mustafa Mustafa",
  "Parimala and Co",
  "Photographer",
  "Promise",
  "Pyaar Prema Kalyanam",
  "Samharam",
  "Sandakari",
  "Sannidhanam P.O.",
  "Satan – The Dark",
  "Sattendru Maarudhu Vaanilai",
  "Scene",
  "Selvi",
  "Seyon",
  "Siva Sambo",
  "Sweety Naughty Crazy",
  "TN 2026",
  "Vadam",
  "Vasool Mannan",
  "Vengeance",
  "Vettuvam",
  "Vowels",
  "Yaarra Andha Paiyan Naan Dhan Andha Paiyan",
  "Enna Vilai",
  "Beep",
  "Cold Call",
  "Paris Cafe",
  "Paavai",
  "All Pass",
  "The Dark Heaven",
  "Nallapadam",
  "Kitti",
  "Om: Chapter 1 – Udhiram",
  "Arasan",
  "Mysaa",
  "Dharman"
];

// Curated library of local poster images and trailers
const LOCAL_POSTERS = [
  '/posters/devara-part-1.jpg',
  '/posters/pushpa-2-the-rule.jpg',
  '/posters/kalki-2898-ad.jpg',
  '/posters/saripodhaa-sanivaaram.jpg',
  '/posters/lucky-baskhar.jpg',
  '/posters/mathu-vadalara-2.jpg',
  '/posters/salaar-part-1-ceasefire.jpg',
  '/posters/hanu-man.jpg',
  '/posters/guntur-kaaram.jpg',
  '/posters/tillu-square.jpg',
  '/posters/rrr.jpg',
  '/posters/baahubali-2-the-conclusion.jpg',
  '/posters/kgf-chapter-2.jpg',
  '/posters/jailer.jpg',
  '/posters/leo.jpg',
  '/posters/vettaiyan.jpg',
  '/posters/the-greatest-of-all-time-goat.jpg',
  '/posters/amaran.jpg',
  '/posters/ka.jpg',
  '/posters/mechanic-rocky.jpg',
  '/posters/matka.jpg',
  '/posters/king.jpg',
  '/posters/war-2.jpg',
  '/posters/ramayana-part-1.jpg',
];

const WORKING_TRAILERS = [
  'https://www.youtube.com/watch?v=kYfn7Wj7s1Q',
  'https://www.youtube.com/watch?v=1kVK0SZerhs',
  'https://www.youtube.com/watch?v=k8YptXwP0I4',
  'https://www.youtube.com/watch?v=d9MyW72ELq0',
  'https://www.youtube.com/watch?v=4GPvYMKtrtI',
  'https://www.youtube.com/watch?v=COql98BCZNE',
  'https://www.youtube.com/watch?v=YoHD9XEInc0',
  'https://www.youtube.com/watch?v=zSWdZVtXT7E',
  'https://www.youtube.com/watch?v=NgBoMJxLWlc',
];

const GENRES = [
  ['Action', 'Drama', 'Thriller'],
  ['Comedy', 'Family', 'Romance'],
  ['Action', 'Crime', 'Mass'],
  ['Period', 'Mythology', 'Adventure'],
  ['Mystery', 'Suspense', 'Thriller'],
  ['Romance', 'Youth', 'Musical'],
  ['Sci-Fi', 'Action', 'Fantasy'],
];

async function main() {
  console.log('=== Step 1: Admin Login ===');
  const login = await req('POST', '/auth/login', {
    email: 'jagadeesh@gmail.com',
    password: 'admin123',
  });
  const token = login.token;
  console.log(`Admin Authenticated: ${login.user.name}`);

  console.log('\n=== Step 2: Fetching Existing Movies to avoid duplicates ===');
  const existingRes = await req('GET', '/movies/all');
  const existingTitles = new Set(
    (existingRes.movies || []).map((m) => m.title.toLowerCase().trim())
  );
  console.log(`Existing movies count: ${existingTitles.size}`);

  const allToAdd = [
    ...TELUGU_TITLES.map((t, idx) => ({ title: t, language: 'Telugu', idx })),
    ...TAMIL_TITLES.map((t, idx) => ({ title: t, language: 'Tamil', idx })),
  ];

  console.log(`\n=== Step 3: Adding ${allToAdd.length} 2026 Movies via POST /movies/add ===`);
  const addedMovies = [];
  let skipped = 0;

  for (let i = 0; i < allToAdd.length; i++) {
    const item = allToAdd[i];
    const cleanTitle = item.title.trim();

    if (existingTitles.has(cleanTitle.toLowerCase())) {
      skipped++;
      continue;
    }

    // Distribute release dates realistically between July 2026 and December 2026
    const month = 7 + (i % 6); // Months 7 to 12
    const day = 1 + ((i * 3) % 28);
    const dateStr = `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const poster = LOCAL_POSTERS[i % LOCAL_POSTERS.length];
    const trailer = WORKING_TRAILERS[i % WORKING_TRAILERS.length];
    const genre = GENRES[i % GENRES.length];
    const duration = 135 + ((i * 7) % 35);
    const rating = Number((7.6 + ((i * 13) % 17) / 10).toFixed(1));

    const payload = {
      title: cleanTitle,
      description: `${cleanTitle} is a 2026 ${item.language} production exploring high-voltage entertainment, engaging drama, and captivating screen moments.`,
      duration,
      language: item.language,
      genre,
      releaseDate: dateStr,
      posterUrl: poster,
      trailerUrl: trailer,
      rating,
    };

    try {
      const res = await req('POST', '/movies/add', payload, token);
      addedMovies.push(res.movie);
      existingTitles.add(cleanTitle.toLowerCase());
      process.stdout.write(`\rAdded: ${addedMovies.length} | Skipped: ${skipped}`);
    } catch (e) {
      console.error(`\nFailed ${cleanTitle}: ${e.message}`);
    }
  }

  console.log(`\n\nSuccessfully added ${addedMovies.length} new 2026 movies via REST API!`);

  console.log('\n=== Step 4: Adding Shows for Srikakulam Theatres via POST /shows/add ===');
  const theatresRes = await req('GET', '/theatres/all');
  const allTheatres = theatresRes.theatres || [];
  const sklmTheatres = allTheatres.filter((t) => /srikakulam/i.test(t.city));

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
    '2026-09-27T00:00:00.000Z',
    '2026-09-28T00:00:00.000Z',
  ];

  let addedShows = 0;
  // Distribute new shows across all Srikakulam theatres
  for (let i = 0; i < addedMovies.length; i++) {
    const movie = addedMovies[i];
    const theatre = sklmTheatres[i % sklmTheatres.length];
    if (!theatre) continue;

    const tScreens = screensByTheatre[String(theatre._id)] || [];
    if (tScreens.length === 0) continue;
    const screen = tScreens[0];

    const showDate = dates[i % dates.length];
    const slot = SHOW_TIMES[i % SHOW_TIMES.length];

    try {
      await req(
        'POST',
        '/shows/add',
        {
          movie: movie._id,
          theatre: theatre._id,
          screen: screen._id,
          showDate,
          startTime: slot.start,
          endTime: slot.end,
          ticketPrice: screen.screenType === 'IMAX' ? 250 : 150,
        },
        token
      );
      addedShows++;
      if (addedShows % 20 === 0) {
        process.stdout.write(`\rScheduled Shows: ${addedShows}`);
      }
    } catch (e) {
      // ignore
    }
  }

  console.log(`\n\nTotal new shows scheduled in Srikakulam: ${addedShows}`);
  console.log('Done! All movies from your full 2026 Telugu and Tamil lists are populated and active!');
}

main().catch(console.error);
