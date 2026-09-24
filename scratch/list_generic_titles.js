const path = require('path');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function listGeneric() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({ title: String, description: String, posterUrl: String, language: String }));
  const all = await Movie.find({});
  const generic = all.filter(m => m.description && m.description.includes('exploring high-voltage entertainment'));
  console.log('Total generic titles:', generic.length);
  generic.forEach((g, i) => {
    console.log(`${i + 1}. [${g.language}] "${g.title}" (Poster: ${g.posterUrl})`);
  });
  await mongoose.disconnect();
}
listGeneric().catch(console.error);
