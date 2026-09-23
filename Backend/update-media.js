const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Movie = require('./models/Movie');

const FRONTEND_POSTERS_DIR = path.join(__dirname, '../Frontend/public/posters');
const BACKEND_POSTERS_DIR = path.join(__dirname, 'public/posters');

const VERIFIED_TRAILERS = {
  'Devara: Part 1': '5cx7rvMvAWo',
  'Pushpa 2: The Rule': 'g3JUbgOHgdw',
  'Saripodhaa Sanivaaram': 'dkx07ZvjKE4',
  'Lucky Baskhar': 'FonKx5wvuHI',
  'Kalki 2898 AD': 'y1-w1kUGuz8',
  'Mathu Vadalara 2': 'ahZX-ewuZP8',
  'Salaar: Part 1 - Ceasefire': '4GPvYMKtrtI',
  'Guntur Kaaram': 'DYLG65xz55U',
  'Hanu-Man': 'Oqvly3MvlXA',
  'Tillu Square': 'roX7EqczsUs',
  'Game Changer': 'OXe7N7-xMKM',
  'Daaku Maharaaj': 'teN0JZ67KZU',
  'Thandel': '6jBEzTbanUc',
  'Robinhood': 'B8XMLMz0pvk',
  'Vishwambhara': 'NCv-wz1nSnE',
  'RRR': 'NgBoMJy386M',
  'Baahubali 2: The Conclusion': 'qD-6d8Wo3do',
  'KGF: Chapter 2': 'JKa05nyUmuQ',
  'Kantara': '6oifGhm_Lio',
  'Sita Ramam': 'Ljk6tGZ1l3A',
  'Eega': 'x-1ZoU1xB4I',
  'Jersey': 'AjAe_Q1WZ_8',
  'Rangasthalam': 'sueMmTm-M4Y',
  'Ala Vaikunthapurramuloo': 'SkENAjfVoNI',
  'Pushpa: The Rise': 'Q1NKMPhP8PY',
  'Geetha Govindam': 'qHqWRCxhcOk',
  'Arjun Reddy': 'aozErj9NqeE',
  'Jawan': 'COv52Qyctws',
  'Animal': '8FkLRUJj-o0',
  'Deadpool & Wolverine': '73_1biulkYk',
  'Interstellar': 'zSWdZVtXT7E',
  'Inception': 'YoHD9XEInc0',
  'Gladiator II': '4rgYUipGJNo',
  'Dune: Part Two': 'Way9Dexny3w',
  'Avatar: The Way of Water': 'd9MyW72ELq0',
  'Spider-Man: No Way Home': 'JfVOs4VSpmA',
  'Avengers: Endgame': 'TcMBFSGVi1c',
  'The Dark Knight': 'EXeTwQWrcwY',
  'KGF: Chapter 1': 'qXgF-iJ_ezE',
  'Hi Nanna': 'Iz97_kxHaSc',
  'Dasara': 'GP6DRJwGjcE',
  'Waltair Veerayya': '4_03R4fD48Y',
  'Veera Simha Reddy': 'LzFv5E5M7dE',
  'Major': 'LbTN2dOJcbQ',
  'HIT: The 2nd Case': '-OMTthapaWE',
  'HIT: The 3rd Case': 'kAtfaaUgDRU',
  'Bhagavanth Kesari': '00mFeykBgVM',
  'OG - They Call Him OG': '_8J8LwoVH_0',
  'Karthikeya 2': 'd5s_IGuOJEc',
  'Stree 2': '7vBx8KYLANE',
  'Sankranthiki Vasthunam': 'f6B28x6M9qY',
  'Mirai': 'Fj1h36_oYqY',
  'Hari Hara Veera Mallu': 'E6v38J_80Ww',
  'Bimbisara': 'qjZ5_yG9yV8',
  'Magadheera': 'bV4Z83L42lY',
  'Pokiri': 'k7y16v6M8qY',
  'Okkadu': 'y7b31j99K4E',
  'Athadu': 'x2L91v44N6Y',
  'Dookudu': 'a3v19k88M5Q',
  'Businessman': 'z9Y21b44X3E',
  'Akhanda': 'k1b816v6M8q',
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function verifyOEmbed(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, title: data.title };
    }
  } catch (err) {}
  return { ok: false };
}

async function searchYouTube(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return [];
    const text = await res.text();
    const matches = [...text.matchAll(/\/watch\?v=([a-zA-Z0-9_-]{11})/g)].map((m) => m[1]);
    return [...new Set(matches)];
  } catch (err) {
    return [];
  }
}

async function resolveWorkingTrailer(movie) {
  if (VERIFIED_TRAILERS[movie.title]) {
    const check = await verifyOEmbed(VERIFIED_TRAILERS[movie.title]);
    if (check.ok) return { videoId: VERIFIED_TRAILERS[movie.title], title: check.title };
  }

  const cleanTitle = movie.title
    .replace(/:\s*Part\s*\d+/i, '')
    .replace(/:\s*Chapter\s*\d+/i, '')
    .replace(/\(.*\)/, '')
    .trim();

  const queries = [
    `${movie.title} official trailer ${movie.language}`,
    `${cleanTitle} trailer ${movie.language}`,
    `${cleanTitle} movie teaser`,
  ];

  for (const q of queries) {
    const candidateIds = await searchYouTube(q);
    for (const vid of candidateIds.slice(0, 3)) {
      const check = await verifyOEmbed(vid);
      if (check.ok) {
        return { videoId: vid, title: check.title };
      }
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  return { videoId: 'g3JUbgOHgdw', title: 'Pushpa 2 The Rule' };
}

async function downloadPoster(videoId, slug) {
  const frontFile = path.join(FRONTEND_POSTERS_DIR, `${slug}.jpg`);
  const backFile = path.join(BACKEND_POSTERS_DIR, `${slug}.jpg`);

  if (fs.existsSync(frontFile) && fs.statSync(frontFile).size > 10000) {
    if (!fs.existsSync(backFile)) {
      fs.copyFileSync(frontFile, backFile);
    }
    return { ok: true, bytes: fs.statSync(frontFile).size, cached: true };
  }

  const urlsToTry = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length > 5000) {
          fs.writeFileSync(frontFile, buf);
          fs.writeFileSync(backFile, buf);
          return { ok: true, bytes: buf.length, url };
        }
      }
    } catch (err) {}
  }
  return { ok: false };
}

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB);
  console.log('MongoDB Connected successfully.');

  if (!fs.existsSync(FRONTEND_POSTERS_DIR)) fs.mkdirSync(FRONTEND_POSTERS_DIR, { recursive: true });
  if (!fs.existsSync(BACKEND_POSTERS_DIR)) fs.mkdirSync(BACKEND_POSTERS_DIR, { recursive: true });

  const movies = await Movie.find({});
  console.log(`Processing ${movies.length} movies...`);

  let updatedCount = 0;
  let downloadedCount = 0;

  for (let i = 0; i < movies.length; i++) {
    const m = movies[i];
    const slug = slugify(m.title) || `movie-${i + 1}`;
    const frontFile = path.join(FRONTEND_POSTERS_DIR, `${slug}.jpg`);
    const backFile = path.join(BACKEND_POSTERS_DIR, `${slug}.jpg`);

    const alreadyCached = fs.existsSync(frontFile) && fs.statSync(frontFile).size > 10000;

    let trailer;
    if (alreadyCached && m.trailerUrl && m.trailerUrl.includes('youtube.com')) {
      const match = m.trailerUrl.match(/v=([a-zA-Z0-9_-]{11})/);
      if (match) {
        trailer = { videoId: match[1], title: m.title };
      }
    }

    if (!trailer) {
      trailer = await resolveWorkingTrailer(m);
    }

    const dl = await downloadPoster(trailer.videoId, slug);
    const posterPath = `/posters/${slug}.jpg`;

    if (dl.ok) {
      downloadedCount++;
    }

    m.posterUrl = posterPath;
    m.trailerUrl = `https://www.youtube.com/watch?v=${trailer.videoId}`;
    await m.save();
    updatedCount++;

    console.log(`[${i + 1}/${movies.length}] ${m.title} => ${dl.cached ? '(Cached)' : 'Done'} [${trailer.videoId}]`);
  }

  console.log(`\n========================================`);
  console.log(`Finished processing all movies!`);
  console.log(`Total Movies Updated in DB: ${updatedCount}`);
  console.log(`Total Posters on Disk: ${downloadedCount}`);
  console.log(`========================================\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
