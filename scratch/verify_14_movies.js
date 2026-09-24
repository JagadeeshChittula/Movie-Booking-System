const path = require('path');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

const list = [
  'Fauzi',
  'Jailer 2',
  'Sigma',
  'Ranabaali',
  'OM: Chapter 1 – Udhiram',
  'Scene',
  'Vishwambhara',
  'Ramayana',
  'Mookuthi Amman 2',
  'Aadarsha Kutumbam House No: 47',
  'Itllu Arjuna',
  'Rupayanamaha',
  'Comrade Kalyan',
  'King 100'
];

async function verify() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({ title: String, language: String, genre: [String], releaseDate: Date }));
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId, isActive: Boolean, screen: mongoose.Schema.Types.ObjectId, showDate: Date, startTime: String }));

  console.log('=== Status of All 14 Requested Movies ===');
  for (const name of list) {
    const movie = await Movie.findOne({ title: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') });
    if (movie) {
      const showCount = await Show.countDocuments({ movie: movie._id, isActive: true });
      console.log(`✓ "${movie.title}" | Lang: ${movie.language} | Genres: [${movie.genre.join(', ')}] | Shows: ${showCount}`);
    } else {
      console.log(`✗ NOT FOUND: "${name}"`);
    }
  }

  // Verify total shows and slot uniqueness
  const allShows = await Show.find({});
  console.log('\nTotal shows in DB:', allShows.length);

  const slotMap = new Map();
  let conflicts = 0;
  allShows.forEach(s => {
    const d = s.showDate ? new Date(s.showDate).toISOString().split('T')[0] : 'nodate';
    const key = String(s.screen) + ':::' + d + ':::' + (s.startTime || '').trim();
    if (slotMap.has(key)) {
      conflicts++;
    } else {
      slotMap.set(key, true);
    }
  });
  console.log('Duplicate screen slots in DB:', conflicts);

  await mongoose.disconnect();
}
verify().catch(console.error);
