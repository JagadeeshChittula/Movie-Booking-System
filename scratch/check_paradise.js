const path = require('path');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function check() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: String,
    description: String,
    posterUrl: String,
    trailerUrl: String,
    genre: [String],
    language: String,
    releaseDate: Date,
    duration: Number,
    rating: Number
  }));
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId, isActive: Boolean }));

  const all = await Movie.find({});
  const matches = all.filter(m => /paradise/i.test(m.title));
  console.log(`Found ${matches.length} matches for Paradise:`);
  for (const m of matches) {
    const showCount = await Show.countDocuments({ movie: m._id, isActive: true });
    console.log({
      id: m._id,
      title: m.title,
      language: m.language,
      genre: m.genre,
      duration: m.duration,
      releaseDate: m.releaseDate,
      posterUrl: m.posterUrl,
      trailerUrl: m.trailerUrl,
      description: m.description,
      shows: showCount
    });
  }

  await mongoose.disconnect();
}
check().catch(console.error);
