const path = require('path');
const fs = require('fs');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function auditAllLegit() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: String,
    description: String,
    posterUrl: String,
    trailerUrl: String,
    language: String,
    genre: [String],
    releaseDate: Date
  }));

  const all = await Movie.find({});
  const legit = all.filter(m => !m.description || !m.description.includes('exploring high-voltage entertainment'));

  console.log(`Checking ${legit.length} legitimate movies...`);

  let invalidPosters = [];
  let invalidTrailers = [];

  legit.forEach(m => {
    // Check poster
    if (!m.posterUrl) {
      invalidPosters.push({ title: m.title, reason: 'Empty posterUrl' });
    } else if (m.posterUrl.startsWith('/posters/')) {
      const filename = m.posterUrl.replace('/posters/', '');
      const filePath = path.resolve(__dirname, '../Backend/public/posters', filename);
      if (!fs.existsSync(filePath)) {
        invalidPosters.push({ title: m.title, reason: `File not found: ${m.posterUrl}` });
      }
    } else if (!m.posterUrl.startsWith('http://') && !m.posterUrl.startsWith('https://')) {
      invalidPosters.push({ title: m.title, reason: `Invalid URL format: ${m.posterUrl}` });
    }

    // Check trailer
    if (!m.trailerUrl) {
      invalidTrailers.push({ title: m.title, reason: 'Empty trailerUrl' });
    } else {
      const match = m.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (!match) {
        invalidTrailers.push({ title: m.title, url: m.trailerUrl, reason: 'Not a valid YouTube video URL' });
      }
    }
  });

  console.log(`Invalid posters count: ${invalidPosters.length}`);
  if (invalidPosters.length > 0) console.log(invalidPosters);

  console.log(`Invalid trailers count: ${invalidTrailers.length}`);
  if (invalidTrailers.length > 0) console.log(invalidTrailers);

  // Check how many movies share the exact same poster among the 144
  const posterMap = {};
  legit.forEach(m => {
    posterMap[m.posterUrl] = (posterMap[m.posterUrl] || []).concat(m.title);
  });
  const dups = Object.entries(posterMap).filter(([url, titles]) => titles.length > 1);
  console.log(`\nShared posters among legitimate movies: ${dups.length}`);
  dups.forEach(([url, titles]) => {
    console.log(`  ${url} shared by: ${titles.join(', ')}`);
  });

  await mongoose.disconnect();
}

auditAllLegit().catch(console.error);
