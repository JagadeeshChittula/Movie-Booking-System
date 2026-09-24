const path = require('path');
const fs = require('fs');
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

async function cleanupAndCorrect() {
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
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId, isActive: Boolean }));

  console.log('=== Step 1: Removing 156 Bogus / Placeholder Copy-Pasted Movies ===');
  const allMovies = await Movie.find({});
  const bogusMovies = allMovies.filter(m => m.description && m.description.includes('exploring high-voltage entertainment'));
  console.log(`Found ${bogusMovies.length} bogus movies to delete (including "Sweety Naughty Crazy", "Pookie", "Kaakaa", etc.)`);

  const bogusIds = bogusMovies.map(b => b._id);
  const deletedShowsResult = await Show.deleteMany({ movie: { $in: bogusIds } });
  console.log(`Deleted ${deletedShowsResult.deletedCount} shows tied to bogus movies.`);

  const deletedMoviesResult = await Movie.deleteMany({ _id: { $in: bogusIds } });
  console.log(`Deleted ${deletedMoviesResult.deletedCount} bogus movies.`);

  console.log('\n=== Step 2: Correcting Real Posters & Trailers for Curated Movies ===');
  // Specific fixes for movies that were previously assigned placeholder kalki poster
  const specificFixes = [
    {
      title: 'Ka',
      posterUrl: '/posters/ka.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=kYfn7Wj7s1Q'
    },
    {
      title: 'Coolie',
      posterUrl: 'https://img.youtube.com/vi/4S-zV5hD5bU/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=4S-zV5hD5bU',
      description: 'Starring Superstar Rajinikanth, Soubin Shahir, Nagarjuna, Shruti Haasan. Directed by Lokesh Kanagaraj. Produced by Sun Pictures. Music by Anirudh Ravichander. A gritty gold smuggling syndicate action spectacle.'
    },
    {
      title: 'Thalapathy 69',
      posterUrl: 'https://img.youtube.com/vi/0pUv-Zk2RzU/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=0pUv-Zk2RzU',
      description: 'Starring Thalapathy Vijay (in his landmark final cinematic project), Pooja Hegde, Bobby Deol. Directed by H. Vinoth. Produced by KVN Productions. Music by Anirudh Ravichander.'
    },
    {
      title: 'Toxic: A Fairy Tale for Grown-ups',
      posterUrl: 'https://img.youtube.com/vi/jYvFCPxywmA/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=jYvFCPxywmA',
      description: 'Starring Rocking Star Yash, Kiara Advani, Nayanthara, Huma Qureshi. Directed by Geethu Mohandas. Produced by KVN Productions & Monster Mind Creations. A dark, stylized underworld fairy tale.'
    },
    {
      title: 'Kantara: Chapter 1',
      posterUrl: 'https://img.youtube.com/vi/Frp0zC4643U/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Frp0zC4643U',
      description: 'Starring & Directed by Rishab Shetty. Produced by Hombale Films. Music by B. Ajaneesh Loknath. The legendary mythological prequel unveiling the origins of the Panjurli Daiva and Kadamba dynasty lore.'
    },
    {
      title: 'Jai Hanuman',
      posterUrl: 'https://img.youtube.com/vi/4G554W2L_qE/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=4G554W2L_qE',
      description: 'Starring Rishab Shetty (Lord Hanuman). Directed by Prasanth Varma. Produced by Mythri Movie Makers. Music by M.M. Keeravani. The grand continuation of the Prasanth Varma Cinematic Universe.'
    },
    {
      title: 'Salaar: Part 2 – Shouryaanga Parvam',
      posterUrl: 'https://img.youtube.com/vi/YoHD9XEInc0/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      description: 'Starring Rebel Star Prabhas & Prithviraj Sukumaran. Directed by Prashanth Neel. Produced by Hombale Films. The brutal clash for Khansaar supremacy between Deva and Varadha.'
    },
    {
      title: 'VD12 (Rowdy Janardhan)',
      posterUrl: 'https://img.youtube.com/vi/d9MyW72ELq0/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      description: 'Starring Vijay Deverakonda & Bhagyashri Borse. Directed by Gowtam Tinnanuri. Produced by Sithara Entertainments & Fortune Four Cinemas. Music by Anirudh Ravichander. A gritty period espionage action thriller.'
    },
    {
      title: 'AA22 (Allu Arjun & Atlee)',
      posterUrl: 'https://img.youtube.com/vi/g3JUbgOHgdw/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgOHgdw',
      description: 'Starring Icon Star Allu Arjun. Directed by Atlee. Produced by Sun Pictures. A pan-world commercial action entertainer blending high-octane emotions with cutting-edge visual grandeur.'
    },
    {
      title: 'The Paradise',
      posterUrl: 'https://img.youtube.com/vi/k8YptXwP0I4/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=k8YptXwP0I4',
      description: 'Starring Nani & Priyamani. Directed by Srikanth Odela. Produced by SLV Cinemas. Music by Santosh Narayanan. A gritty raw period action spectacle set in 1980s Telangana.'
    },
    {
      title: 'Kaithi 2 (LCU)',
      posterUrl: 'https://img.youtube.com/vi/COql98BCZNE/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=COql98BCZNE',
      description: 'Starring Karthi (as Dilli) & Kamal Haasan. Directed by Lokesh Kanagaraj. Produced by Dream Warrior Pictures. Music by Sam C.S. Dilli enters the heart of the Lokesh Cinematic Universe.'
    },
    {
      title: 'Rolex (Standalone)',
      posterUrl: 'https://img.youtube.com/vi/COql98BCZNE/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=COql98BCZNE',
      description: 'Starring Suriya (as Rolex). Directed by Lokesh Kanagaraj. Produced by Raaj Kamal Films International. The origin and brutal reign of the ruthless syndicate kingpin Rolex.'
    },
    {
      title: 'Love & War',
      posterUrl: 'https://img.youtube.com/vi/kYfn7Wj7s1Q/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=kYfn7Wj7s1Q',
      description: 'Starring Ranbir Kapoor, Alia Bhatt, Vicky Kaushal. Directed by Sanjay Leela Bhansali. Produced by Bhansali Productions. A timeless, sweeping epic romance against wartime conflict.'
    },
    {
      title: 'Bhool Bhulaiyaa 3',
      posterUrl: 'https://img.youtube.com/vi/x_r7tU7eD8E/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=x_r7tU7eD8E',
      description: 'Starring Kartik Aaryan, Vidya Balan, Madhuri Dixit, Triptii Dimri. Directed by Anees Bazmee. Produced by T-Series & Cine1 Studios. Rooh Baba confronts the return of the real Manjulika.'
    },
    {
      title: 'Singham Again',
      posterUrl: 'https://img.youtube.com/vi/8Qn_spdM5Zg/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=8Qn_spdM5Zg',
      description: 'Starring Ajay Devgn, Kareena Kapoor, Ranveer Singh, Akshay Kumar, Deepika Padukone, Tiger Shroff, Arjun Kapoor. Directed by Rohit Shetty. Bajirao Singham leads the cop universe in a grand Ramayana-inspired battle.'
    },
    {
      title: 'Star Wars: The Mandalorian & Grogu',
      posterUrl: 'https://img.youtube.com/vi/bC_W1k0g89U/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=bC_W1k0g89U',
      description: 'Starring Pedro Pascal. Directed by Jon Favreau. Produced by Lucasfilm. Din Djarin and young apprentice Grogu embark on a brand new cinematic galactic adventure.'
    },
    {
      title: 'Dune: Messiah',
      posterUrl: 'https://img.youtube.com/vi/Way9Dexny3w/hqdefault.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      description: 'Starring Timothée Chalamet, Zendaya, Florence Pugh, Anya Taylor-Joy. Directed by Denis Villeneuve. Produced by Legendary Pictures & Warner Bros. The epic conclusion of Paul Atreides\' galactic jihad.'
    }
  ];

  for (const fix of specificFixes) {
    const movie = await Movie.findOne({ title: fix.title });
    if (movie) {
      movie.posterUrl = fix.posterUrl;
      movie.trailerUrl = fix.trailerUrl;
      if (fix.description) movie.description = fix.description;
      await movie.save();
      console.log(`✓ Updated "${movie.title}" -> Poster: ${movie.posterUrl}, Trailer: ${movie.trailerUrl}`);
    }
  }

  console.log('\n=== Step 3: Final Verification of Entire Movie Catalog ===');
  const remaining = await Movie.find({}).sort({ title: 1 });
  console.log(`Total clean movies in catalog: ${remaining.length}`);

  // Check shared posters
  const posterMap = {};
  remaining.forEach(m => {
    posterMap[m.posterUrl] = (posterMap[m.posterUrl] || []).concat(m.title);
  });
  const dups = Object.entries(posterMap).filter(([url, titles]) => titles.length > 1);
  console.log(`Shared posters count across remaining movies: ${dups.length}`);
  if (dups.length > 0) {
    dups.forEach(([url, titles]) => console.log(`  ${url} -> ${titles.join(', ')}`));
  }

  // Check remaining shows
  const totalShows = await Show.countDocuments({ isActive: true });
  console.log(`Total shows remaining in database: ${totalShows}`);

  await mongoose.disconnect();
}

cleanupAndCorrect().catch(console.error);
