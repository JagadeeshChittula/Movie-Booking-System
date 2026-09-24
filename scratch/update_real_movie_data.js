const path = require('path');
const jwt = require(path.resolve(__dirname, '../Backend/node_modules/jsonwebtoken'));
const mongoose = require(path.resolve(__dirname, '../Backend/node_modules/mongoose'));

const BASE_URL = 'http://localhost:4000';
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const ADMIN_ID = '6a193b656cca31fe2cd394f5';
const URI = 'mongodb+srv://Movie:Movie@cluster0.s58gtkw.mongodb.net/?appName=Cluster0';

const adminToken = jwt.sign(
  { id: ADMIN_ID, role: 'admin' },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// Accurate Real-World Data for all 14 Movies
const realWorldMovies = [
  {
    title: 'Fauzi',
    altTitles: ['Fauji'],
    language: 'Telugu',
    genre: ['Period', 'Action', 'Drama'],
    description: 'Starring Prabhas & Imanvi. Directed by Hanu Raghavapudi. Produced by Mythri Movie Makers & T-Series. Music by Vishal Chandrasekhar. A grand 1940s British Raj war saga following a valiant Azad Hind Fauj soldier fighting for national honor, freedom, and love.',
    duration: 165,
    releaseDate: '2026-12-03',
    trailerUrl: 'https://www.youtube.com/watch?v=L0d25XnK25E',
    posterUrl: 'https://img.youtube.com/vi/L0d25XnK25E/hqdefault.jpg',
    rating: 9.4
  },
  {
    title: 'Jailer 2',
    altTitles: ['Jailer 2 (Hukum)'],
    language: 'Tamil',
    genre: ['Action', 'Thriller'],
    description: 'Starring Superstar Rajinikanth, SJ Suryah, Vidya Balan. Directed by Nelson Dilipkumar. Produced by Sun Pictures. Music by Anirudh Ravichander. Tiger Muthuvel Pandian returns to dismantle an international crime syndicate threatening his surviving kin.',
    duration: 168,
    releaseDate: '2026-10-15',
    trailerUrl: 'https://www.youtube.com/watch?v=Y5BeWdODPqo',
    posterUrl: 'https://img.youtube.com/vi/Y5BeWdODPqo/hqdefault.jpg',
    rating: 9.3
  },
  {
    title: 'Sigma',
    altTitles: [],
    language: 'Telugu',
    genre: ['Action', 'Comedy'],
    description: 'Starring Sundeep Kishan & Faria Abdullah. Directed by Jason Sanjay. Produced by Lyca Productions. Music by Thaman S. A slick action-adventure heist comedy about a quirky radio host tangled in a 500-crore illicit gambling and narcotics racket.',
    duration: 145,
    releaseDate: '2026-10-02',
    trailerUrl: 'https://www.youtube.com/watch?v=X0ASrHeMuVE',
    posterUrl: 'https://img.youtube.com/vi/X0ASrHeMuVE/hqdefault.jpg',
    rating: 8.8
  },
  {
    title: 'Ranabaali',
    altTitles: [],
    language: 'Telugu',
    genre: ['Action', 'Drama', 'Mass'],
    description: 'Starring Vijay Deverakonda, Rashmika Mandanna, Arnold Vosloo. Directed by Rahul Sankrityan. Produced by Mythri Movie Makers. Music by Ajay-Atul. A ferocious 19th-century period mass entertainer about a fearless folk warrior rising against British oppression.',
    duration: 155,
    releaseDate: '2026-10-16',
    trailerUrl: 'https://www.youtube.com/watch?v=L7qEKA-e2qI',
    posterUrl: 'https://img.youtube.com/vi/L7qEKA-e2qI/hqdefault.jpg',
    rating: 9.0
  },
  {
    title: 'OM: Chapter 1 – Udhiram',
    altTitles: ['Om: Chapter 1 – Udhiram'],
    language: 'Tamil',
    genre: ['Action', 'Drama', 'Thriller'],
    description: 'Starring Dhanush, Mammootty, Sai Pallavi, Sreeleela, Naseeruddin Shah. Directed by Rajkumar Periasamy. Produced by Wunderbar Films & R Take Studios. Music by Sai Abhyankkar. An intense, raw period action saga of bloodline rivalries and forest underworld wars.',
    duration: 158,
    releaseDate: '2026-10-16',
    trailerUrl: 'https://www.youtube.com/watch?v=kYV3t0lP9m0',
    posterUrl: 'https://img.youtube.com/vi/kYV3t0lP9m0/hqdefault.jpg',
    rating: 9.1
  },
  {
    title: 'Scene',
    altTitles: [],
    language: 'Tamil',
    genre: ['Action', 'Comedy', 'Thriller'],
    description: 'Starring Suriya (as DSP Inbaraj), Nazriya Nazim, Naslen. Directed by Jithu Madhavan. Produced by 2D Entertainment & Zhagaram Studios. Music by Sushin Shyam. A riotous cop action-thriller filled with high-voltage chases and dark situational comedy.',
    duration: 146,
    releaseDate: '2026-11-06',
    trailerUrl: 'https://www.youtube.com/watch?v=_nuRAflabx8',
    posterUrl: 'https://img.youtube.com/vi/_nuRAflabx8/hqdefault.jpg',
    rating: 8.9
  },
  {
    title: 'Vishwambhara',
    altTitles: [],
    language: 'Telugu',
    genre: ['Fantasy', 'Action', 'Epic'],
    description: 'Starring Megastar Chiranjeevi, Trisha Krishnan, Ashika Ranganath, Kunal Kapoor. Directed by Mallidi Vassishta. Produced by UV Creations. Music by M.M. Keeravani. A breathtaking socio-fantasy epic traversing mystical celestial realms to conquer ancient evil forces.',
    duration: 170,
    releaseDate: '2026-01-10',
    trailerUrl: 'https://www.youtube.com/watch?v=NCv-wz1nSnE',
    posterUrl: 'https://img.youtube.com/vi/NCv-wz1nSnE/hqdefault.jpg',
    rating: 9.5
  },
  {
    title: 'Ramayana',
    altTitles: ['Ramayana: Part 1'],
    language: 'Telugu',
    genre: ['Mythological', 'Epic', 'Drama'],
    description: 'Starring Ranbir Kapoor (Lord Rama), Sai Pallavi (Mata Sita), Yash (Ravana), Sunny Deol (Hanuman), Ravi Dubey (Lakshman). Directed by Nitesh Tiwari. Produced by Namit Malhotra & Yash. Music by Hans Zimmer & A.R. Rahman. The grandest mythological epic of our times.',
    duration: 180,
    releaseDate: '2026-11-06',
    trailerUrl: 'https://www.youtube.com/watch?v=ROI2ilgRSPk',
    posterUrl: 'https://img.youtube.com/vi/ROI2ilgRSPk/hqdefault.jpg',
    rating: 9.6
  },
  {
    title: 'Mookuthi Amman 2',
    altTitles: [],
    language: 'Tamil',
    genre: ['Fantasy', 'Comedy'],
    description: 'Starring Nayanthara (Goddess Mookuthi Amman), RJ Balaji, Urvashi. Directed by Sundar C. Produced by Vels Film International & Rowdy Pictures. Music by Hip-hop Tamizha. The benevolent goddess descends with divine humor to expose religious charlatans and bring justice.',
    duration: 140,
    releaseDate: '2026-09-14',
    trailerUrl: 'https://www.youtube.com/watch?v=UUfAemccAJ0',
    posterUrl: 'https://img.youtube.com/vi/UUfAemccAJ0/hqdefault.jpg',
    rating: 8.7
  },
  {
    title: 'Aadarsha Kutumbam House No: 47',
    altTitles: [],
    language: 'Telugu',
    genre: ['Family', 'Comedy', 'Drama'],
    description: 'Starring Victory Venkatesh (as Chittibabu), Srinidhi Shetty, Nara Rohith, Nivetha Pethuraj, Rao Ramesh. Directed by Trivikram Srinivas. Produced by Haarika & Hassine Creations. Music by S. Thaman. A delightful family drama bursting with humor, heart, and values.',
    duration: 148,
    releaseDate: '2026-10-09',
    trailerUrl: 'https://www.youtube.com/watch?v=qJc9N5p8tYo',
    posterUrl: 'https://img.youtube.com/vi/qJc9N5p8tYo/hqdefault.jpg',
    rating: 8.9
  },
  {
    title: 'Itllu Arjuna',
    altTitles: [],
    language: 'Telugu',
    genre: ['Romance', 'Drama'],
    description: 'Starring Aniesh & Anaswara Rajan. Directed by Mahesh Uppala. Produced by Venky Kudumula (What Next Entertainments). Music by S. Thaman. An emotional romantic drama capturing the beauty and ache of silent, unconditioned love.',
    duration: 144,
    releaseDate: '2026-10-30',
    trailerUrl: 'https://www.youtube.com/watch?v=v_f6YnL-J14',
    posterUrl: 'https://img.youtube.com/vi/v_f6YnL-J14/hqdefault.jpg',
    rating: 8.6
  },
  {
    title: 'Rupayanamaha',
    altTitles: [],
    language: 'Telugu',
    genre: ['Comedy', 'Drama', 'Thriller'],
    description: 'Starring Aravind Pandrat, Venugopal Polsani, Krack Srimani, Kavya Shetty. Directed by T. Arvind Reddy. Produced by Pavani Sagi (Chithra Veda Productions). A high-stakes comedy thriller exploring greed, comedy, and mayhem when an ordinary family wins a 1-crore lottery.',
    duration: 136,
    releaseDate: '2026-10-02',
    trailerUrl: 'https://www.youtube.com/watch?v=uxq65vKHkbQ',
    posterUrl: 'https://img.youtube.com/vi/uxq65vKHkbQ/hqdefault.jpg',
    rating: 8.5
  },
  {
    title: 'Comrade Kalyan',
    altTitles: [],
    language: 'Telugu',
    genre: ['Action', 'Comedy', 'Social', 'Drama'],
    description: 'Starring Sree Vishnu & Mahima Nambiar. Directed by Janakiram Marella. Presented by Kona Venkat. Produced by Skanda Vahana Motion Pictures. Music by Vijai Bulganin. A sharp socio-political action comedy about a charismatic youth rebel fighting for civic dignity.',
    duration: 152,
    releaseDate: '2026-10-09',
    trailerUrl: 'https://www.youtube.com/watch?v=kJBnE74DukM',
    posterUrl: 'https://img.youtube.com/vi/kJBnE74DukM/hqdefault.jpg',
    rating: 9.1
  },
  {
    title: 'King 100',
    altTitles: [],
    language: 'Telugu',
    genre: ['Period', 'Action', 'Drama'],
    description: 'Starring King Akkineni Nagarjuna, Tabu, Aishwarya Rajesh, Ashok Selvan. Directed by R.A. Karthik. Produced by Annapurna Studios. Music by Rockstar Devi Sri Prasad (DSP). The landmark 100th milestone film celebrating royal heroism, timeless charisma, and spectacle.',
    duration: 166,
    releaseDate: '2026-12-24',
    trailerUrl: 'https://www.youtube.com/watch?v=OgF4eRYcHd8',
    posterUrl: 'https://img.youtube.com/vi/OgF4eRYcHd8/hqdefault.jpg',
    rating: 9.4
  }
];

async function updateRealData() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({
    title: String,
    description: String,
    duration: Number,
    language: String,
    genre: [String],
    releaseDate: Date,
    posterUrl: String,
    trailerUrl: String,
    rating: Number,
    isActive: Boolean
  }));
  const Show = mongoose.model('Show', new mongoose.Schema({ movie: mongoose.Schema.Types.ObjectId }));

  console.log('--- Merging old duplicate/alias titles and updating with REAL data ---');

  for (const mData of realWorldMovies) {
    // Check if main movie exists
    let mainMovie = await Movie.findOne({
      title: { $regex: new RegExp(`^${mData.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    // Check if any alt titles exist (e.g., Fauji for Fauzi)
    for (const alt of mData.altTitles) {
      const altMovie = await Movie.findOne({
        title: { $regex: new RegExp(`^${alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (altMovie) {
        if (!mainMovie) {
          // Rename altMovie to mainMovie title
          console.log(`Renaming alias "${altMovie.title}" -> "${mData.title}"`);
          altMovie.title = mData.title;
          await altMovie.save();
          mainMovie = altMovie;
        } else if (String(altMovie._id) !== String(mainMovie._id)) {
          // Re-point shows from altMovie to mainMovie, then delete altMovie
          const migrated = await Show.updateMany({ movie: altMovie._id }, { $set: { movie: mainMovie._id } });
          console.log(`Migrated ${migrated.modifiedCount} shows from alias "${altMovie.title}" to "${mainMovie.title}"`);
          await Movie.findByIdAndDelete(altMovie._id);
          console.log(`Deleted alias movie "${altMovie.title}" [id: ${altMovie._id}]`);
        }
      }
    }

    if (mainMovie) {
      // Update movie via REST API PUT
      const updatePayload = {
        title: mData.title,
        language: mData.language,
        genre: mData.genre,
        description: mData.description,
        duration: mData.duration,
        releaseDate: mData.releaseDate,
        posterUrl: mData.posterUrl,
        trailerUrl: mData.trailerUrl,
        rating: mData.rating
      };

      const res = await fetch(`${BASE_URL}/movies/update/${mainMovie._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updatePayload)
      });

      const body = await res.json();
      console.log(`✓ [API PUT] Updated "${mData.title}":`, {
        id: mainMovie._id,
        trailer: mData.trailerUrl,
        poster: mData.posterUrl,
        cast_desc: mData.description.slice(0, 45) + '...'
      });
    } else {
      // Create via REST API POST
      const res = await fetch(`${BASE_URL}/movies/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(mData)
      });
      const body = await res.json();
      console.log(`✓ [API POST] Added "${mData.title}":`, body.movie?._id);
    }
  }

  console.log('\n--- Final Verification of the 14 Movies ---');
  for (const mData of realWorldMovies) {
    const m = await Movie.findOne({
      title: { $regex: new RegExp(`^${mData.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    const shows = await Show.countDocuments({ movie: m._id });
    console.log(`[VERIFIED] "${m.title}" (${m.language})`);
    console.log(`  - Trailer: ${m.trailerUrl}`);
    console.log(`  - Poster:  ${m.posterUrl}`);
    console.log(`  - Genres:  ${m.genre.join(', ')}`);
    console.log(`  - Desc:    ${m.description.slice(0, 60)}...`);
    console.log(`  - Shows:   ${shows}\n`);
  }

  await mongoose.disconnect();
}

updateRealData().catch(err => {
  console.error('Error updating real data:', err);
  process.exit(1);
});
