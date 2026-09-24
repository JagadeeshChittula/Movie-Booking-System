const path = require('path');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

const list = [
  { title: 'Fauzi', alt: 'Fauji', lang: 'Telugu', genre: ['Period', 'Action', 'Drama'] },
  { title: 'Jailer 2', alt: 'Jailer 2 (Hukum)', lang: 'Tamil', genre: ['Action', 'Thriller'] },
  { title: 'Sigma', lang: 'Telugu', genre: ['Action', 'Comedy'] },
  { title: 'Ranabaali', lang: 'Telugu', genre: ['Action', 'Drama'] },
  { title: 'OM: Chapter 1 – Udhiram', alt: 'Om: Chapter 1 – Udhiram', lang: 'Tamil', genre: ['Action', 'Drama'] },
  { title: 'Scene', lang: 'Tamil', genre: ['Action'] },
  { title: 'Vishwambhara', lang: 'Telugu', genre: ['Fantasy', 'Action', 'Epic'] },
  { title: 'Ramayana', alt: 'Ramayana: Part 1', lang: 'Pan-India/Telugu', genre: ['Mythological', 'Epic', 'Drama'] },
  { title: 'Mookuthi Amman 2', lang: 'Tamil', genre: ['Fantasy', 'Comedy'] },
  { title: 'Aadarsha Kutumbam House No: 47', lang: 'Telugu', genre: ['Family', 'Drama'] },
  { title: 'Itllu Arjuna', lang: 'Telugu', genre: ['Romance', 'Drama'] },
  { title: 'Rupayanamaha', lang: 'Telugu', genre: ['Drama'] },
  { title: 'Comrade Kalyan', lang: 'Telugu', genre: ['Political', 'Social', 'Drama'] },
  { title: 'King 100', alt: 'King', lang: 'Telugu', genre: ['Period', 'Milestone', 'Drama'] }
];

async function check() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({ title: String, language: String, genre: [String], releaseDate: Date }));
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId, isActive: Boolean }));

  for (const item of list) {
    const query = [
      { title: new RegExp('^' + item.title + '$', 'i') }
    ];
    if (item.alt) {
      query.push({ title: new RegExp('^' + item.alt + '$', 'i') });
    }
    const movie = await Movie.findOne({ $or: query });
    if (movie) {
      const showCount = await Show.countDocuments({ movie: movie._id, isActive: true });
      console.log(`FOUND: "${movie.title}" (${movie.language}) [id: ${movie._id}] -> ${showCount} active shows`);
    } else {
      console.log(`NOT FOUND: "${item.title}"`);
    }
  }
  await mongoose.disconnect();
}
check();
