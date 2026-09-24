const path = require('path');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function audit() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: String,
    posterUrl: String,
    trailerUrl: String,
    description: String,
    language: String,
    genre: [String],
    releaseDate: Date
  }));

  const all = await Movie.find({});
  console.log('Total movies in DB:', all.length);

  const posterCounts = {};
  all.forEach(m => {
    posterCounts[m.posterUrl] = (posterCounts[m.posterUrl] || 0) + 1;
  });
  const repeatedPosters = Object.entries(posterCounts).filter(([url, count]) => count > 1);
  console.log('\nRepeated Poster URLs:');
  repeatedPosters.forEach(([url, count]) => {
    console.log(`  ${count} movies share poster: ${url}`);
  });

  const genericDesc = all.filter(m => m.description && m.description.includes('exploring high-voltage entertainment'));
  console.log('\nMovies with generic copy-pasted description:', genericDesc.length);

  // Group by how they were seeded
  const localPosters = all.filter(m => m.posterUrl && m.posterUrl.startsWith('/posters/'));
  console.log('\nMovies pointing to local /posters/:', localPosters.length);

  await mongoose.disconnect();
}
audit().catch(console.error);
