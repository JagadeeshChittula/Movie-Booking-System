const path = require('path');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function inspectAll() {
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
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId, isActive: Boolean }));

  const all = await Movie.find({}).sort({ title: 1 });
  console.log(`Total movies in DB: ${all.length}`);

  // Print all movies with basic flags
  const summary = all.map(m => {
    const isGeneric = m.description && m.description.includes('exploring high-voltage entertainment');
    return {
      id: m._id,
      title: m.title,
      language: m.language,
      posterUrl: m.posterUrl,
      trailerUrl: m.trailerUrl,
      isGeneric: !!isGeneric
    };
  });

  const genericList = summary.filter(s => s.isGeneric);
  const legitimateList = summary.filter(s => !s.isGeneric);

  console.log(`\nLegitimate/Original curated movies: ${legitimateList.length}`);
  console.log(`Generic copy-paste movies: ${genericList.length}`);

  console.log('\n--- First 30 Generic Movies ---');
  genericList.slice(0, 30).forEach(g => {
    console.log(`  [${g.language}] "${g.title}" -> Poster: ${g.posterUrl}, Trailer: ${g.trailerUrl}`);
  });

  console.log('\n--- Legitimate Movies Samples ---');
  legitimateList.slice(0, 20).forEach(l => {
    console.log(`  [${l.language}] "${l.title}" -> Poster: ${l.posterUrl}`);
  });

  await mongoose.disconnect();
}
inspectAll().catch(console.error);
