const path = require('path');
const fs = require('fs');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function auditLegit() {
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

  const all = await Movie.find({}).sort({ title: 1 });
  const legitimate = all.filter(m => !m.description || !m.description.includes('exploring high-voltage entertainment'));
  const generic = all.filter(m => m.description && m.description.includes('exploring high-voltage entertainment'));

  console.log(`Legitimate count: ${legitimate.length}`);
  console.log(`Generic copy-pasted count: ${generic.length}`);

  // Check how many generic movies have shows
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId, isActive: Boolean }));
  const genericIds = generic.map(g => g._id);
  const showsOnGeneric = await Show.countDocuments({ movie: { $in: genericIds } });
  console.log(`Shows scheduled on generic copy-pasted movies: ${showsOnGeneric}`);

  // Sample legitimate movies
  console.log('\n--- Legitimate Movies Audit ---');
  let mismatchedPosters = 0;
  for (const m of legitimate) {
    const poster = m.posterUrl || '';
    // If it points to /posters/slug.jpg, let's see if the file exists
    if (poster.startsWith('/posters/')) {
      const filename = poster.replace('/posters/', '');
      const filePath = path.resolve(__dirname, '../Backend/public/posters', filename);
      const exists = fs.existsSync(filePath);
      if (!exists) {
        console.log(`[FILE MISSING] "${m.title}" -> ${poster}`);
      }
    }
  }

  await mongoose.disconnect();
}
auditLegit().catch(console.error);
