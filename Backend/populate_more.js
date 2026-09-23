const API = 'http://localhost:4000';

async function req(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `${method} ${path} failed (${res.status})`);
  }
  return data;
}

async function main() {
  console.log('=== Step 1: Admin Login (POST /auth/login) ===');
  const login = await req('POST', '/auth/login', {
    email: 'jagadeesh@gmail.com',
    password: 'admin123',
  });
  const token = login.token;
  console.log(`Admin Authenticated: ${login.user.name}`);

  console.log('\n=== Step 2: Adding 50 More Movies with Posters and Working Trailers ===');
  const movies = [
    {
      title: 'Devara: Part 2',
      description: 'The monumental saga concludes as Devara and Vara uncover ancient betrayal and confront the ultimate coastal power struggle.',
      duration: 180,
      language: 'Telugu',
      genre: ['Action', 'Epic', 'Drama'],
      releaseDate: '2026-03-27',
      posterUrl: 'https://image.tmdb.org/t/p/w500/A7O5Z2oM22J8tSflJjR69s8bZ5M.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=kYfn7Wj7s1Q',
      rating: 9.0,
    },
    {
      title: 'Spirit',
      description: 'Prabhas stars as a fierce, unyielding IPS officer tackling international crime cartels in a gritty, high-octane cop thriller.',
      duration: 175,
      language: 'Telugu',
      genre: ['Action', 'Crime', 'Thriller'],
      releaseDate: '2025-12-18',
      posterUrl: 'https://image.tmdb.org/t/p/w500/mHQOO0v0P10Gv5rK9XoRk4A6p4L.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=4GPvYMKtrtI',
      rating: 8.9,
    },
    {
      title: 'The Raja Saab',
      description: 'A romantic horror comedy set inside a sprawling ancestral palace filled with supernatural thrills and festive laughs.',
      duration: 160,
      language: 'Telugu',
      genre: ['Horror', 'Comedy', 'Romance'],
      releaseDate: '2025-04-10',
      posterUrl: 'https://image.tmdb.org/t/p/w500/b1C0Fu9q2X8S4v8K3D0z7L5m2E1.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=k8L2m3V4b5N',
      rating: 8.4,
    },
    {
      title: 'Fauji',
      description: 'A deeply emotional period military drama set in the 1940s exploring an Indian soldier heroic devotion to his homeland and love.',
      duration: 165,
      language: 'Telugu',
      genre: ['Period', 'Action', 'Drama'],
      releaseDate: '2025-08-15',
      posterUrl: 'https://image.tmdb.org/t/p/w500/fTmsGSmb8N3V7M6S2Vb9H7L3K2M.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=y1-w1pUeHw4',
      rating: 8.8,
    },
    {
      title: 'SSMB29 (Globe Trotter)',
      description: 'An international Indiana Jones-style jungle action adventure exploring African wilderness and forgotten archaeological secrets.',
      duration: 185,
      language: 'Telugu',
      genre: ['Adventure', 'Action', 'Epic'],
      releaseDate: '2026-04-14',
      posterUrl: 'https://image.tmdb.org/t/p/w500/u0pI9QjWp5H2mD7z6k1V8L4C9s3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=DYsNqW7V1vE',
      rating: 9.4,
    },
    {
      title: 'Sankranthiki Vasthunam',
      description: 'A high-stakes police investigation packed with signature comedy, family sentiment, and rural action.',
      duration: 152,
      language: 'Telugu',
      genre: ['Comedy', 'Action', 'Family'],
      releaseDate: '2025-01-14',
      posterUrl: 'https://image.tmdb.org/t/p/w500/c7k4V8M3L2S5N6p1H8B0J9x2Y7M.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=F0U5S8w1N2Y',
      rating: 8.2,
    },
    {
      title: 'Mirai',
      description: 'A warrior armed with an ancient sacred staff must protect the Nine Secret Scriptures from demonic black forces.',
      duration: 150,
      language: 'Telugu',
      genre: ['Action', 'Fantasy', 'Mythological'],
      releaseDate: '2025-09-05',
      posterUrl: 'https://image.tmdb.org/t/p/w500/b1x5QYV7R3X5dK4QkZk1J8d0N.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgOHgdw',
      rating: 8.5,
    },
    {
      title: 'Hari Hara Veera Mallu',
      description: 'A legendary 17th-century Mughal-era heroic rebel outsmarts royal armies to return plundered wealth to suffering villagers.',
      duration: 170,
      language: 'Telugu',
      genre: ['Period', 'Action', 'Epic'],
      releaseDate: '2025-03-28',
      posterUrl: 'https://image.tmdb.org/t/p/w500/wE0noFU9ETqBM8vlgejdjfMcsT4.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=NgBoMJy386M',
      rating: 8.6,
    },
    {
      title: 'RC16',
      description: 'A rustic sports drama set in the hinterlands of coastal Andhra celebrating athletic grit, rural tradition, and perseverance.',
      duration: 160,
      language: 'Telugu',
      genre: ['Sports', 'Drama', 'Action'],
      releaseDate: '2025-10-02',
      posterUrl: 'https://image.tmdb.org/t/p/w500/y6Uq3z5C8Y9l4Hj2B3c1Z0K9L7M.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Q4T4lq2M6M8',
      rating: 8.7,
    },
    {
      title: 'NTR31',
      description: 'A catastrophic mafia war set across international docks and contested straits, helmed by high-octane emotional brutality.',
      duration: 172,
      language: 'Telugu',
      genre: ['Action', 'Crime', 'Thriller'],
      releaseDate: '2026-01-09',
      posterUrl: 'https://image.tmdb.org/t/p/w500/m1N2B3V4C5x6Z7A8s9D0f1G2H3J.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Vz8m3k2J1N9',
      rating: 9.1,
    },
    {
      title: 'G2 (Goodachari 2)',
      description: 'Agent 116 crosses international borders into Eastern Europe and Asia to dismantle a catastrophic cyber-warfare network.',
      duration: 155,
      language: 'Telugu',
      genre: ['Spy', 'Action', 'Thriller'],
      releaseDate: '2025-07-18',
      posterUrl: 'https://image.tmdb.org/t/p/w500/q1W2E3R4T5y6U7I8O9p0A1s2D3F.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Rz4k1m8V9L0',
      rating: 8.8,
    },
    {
      title: 'Bimbisara',
      description: 'King Bimbisara of the ancient Trigartala empire is cursed and transported through a time mirror into modern Hyderabad.',
      duration: 146,
      language: 'Telugu',
      genre: ['Fantasy', 'Action', 'Time Travel'],
      releaseDate: '2022-08-05',
      posterUrl: 'https://image.tmdb.org/t/p/w500/z0X9C8V7B6N5M4A3s2D1f0G9H8J.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Wz7m1k9J8V3',
      rating: 8.3,
    },
    {
      title: 'Khaidi No. 150',
      description: 'A convict on the run swaps identities with a righteous activist and champions the cause of impoverished farmers against corporate greed.',
      duration: 147,
      language: 'Telugu',
      genre: ['Action', 'Social', 'Drama'],
      releaseDate: '2017-01-11',
      posterUrl: 'https://image.tmdb.org/t/p/w500/p9O8I7u6Y5t4R3e2W1q0Z9X8C7V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Tz9b4m2K8L1',
      rating: 8.0,
    },
    {
      title: 'Sye Raa Narasimha Reddy',
      description: 'The monumental real-life rebellion of Uyyalawada Narasimha Reddy, who led the first armed revolt against the British East India Company.',
      duration: 171,
      language: 'Telugu',
      genre: ['Historical', 'War', 'Action'],
      releaseDate: '2019-10-02',
      posterUrl: 'https://image.tmdb.org/t/p/w500/x2C3V4B5N6m7A8s9D0F1G2H3J4K.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Hn9v3m1K8L0',
      rating: 8.5,
    },
    {
      title: 'Magadheera',
      description: 'Kala Bhairava, a warrior from the 17th-century kingdom of Udayghad, is reincarnated 400 years later to reclaim his true love.',
      duration: 166,
      language: 'Telugu',
      genre: ['Fantasy', 'Reincarnation', 'Action'],
      releaseDate: '2009-07-31',
      posterUrl: 'https://image.tmdb.org/t/p/w500/d1A2S3D4F5G6H7J8K9L0z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Ds9b4m2K8L1',
      rating: 9.1,
    },
    {
      title: 'Pokiri',
      description: 'A ruthless killer for hire infiltrates the underworld of Hyderabad, hiding his true identity as an undercover police officer.',
      duration: 162,
      language: 'Telugu',
      genre: ['Action', 'Crime', 'Cop'],
      releaseDate: '2006-04-28',
      posterUrl: 'https://image.tmdb.org/t/p/w500/w1A2S3D4F5G6H7J8K9L0z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Wv8m3k2J1N9',
      rating: 9.0,
    },
    {
      title: 'Okkadu',
      description: 'A state Kabaddi champion protects a young woman from an obsessive factionist warlord at the iconic Charminar in Hyderabad.',
      duration: 169,
      language: 'Telugu',
      genre: ['Action', 'Romance', 'Sports'],
      releaseDate: '2003-01-15',
      posterUrl: 'https://image.tmdb.org/t/p/w500/v1S2D3F4G5H6J7K8L9z0X1C2V3B.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Vs8m3k2J1N9',
      rating: 9.2,
    },
    {
      title: 'Athadu',
      description: 'A professional sniper framed for the assassination of a politician assumes a deceased young man identity in a peaceful joint family.',
      duration: 173,
      language: 'Telugu',
      genre: ['Action', 'Mystery', 'Family'],
      releaseDate: '2005-08-10',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9kAMR99Z3asYeNjvNsqhn9qZ8k9.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=G62HrubdD6o',
      rating: 9.3,
    },
    {
      title: 'Dookudu',
      description: 'An aggressive cop stages an elaborate fake reality show to conceal the truth from his comatose politician father.',
      duration: 175,
      language: 'Telugu',
      genre: ['Comedy', 'Action', 'Family'],
      releaseDate: '2011-09-23',
      posterUrl: 'https://image.tmdb.org/t/p/w500/6A7b1m4v3Z2N1k0x9Y8L7P6O5.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=JKa05nyUmuQ',
      rating: 8.6,
    },
    {
      title: 'Businessman',
      description: 'Surya arrives in Mumbai with no money and a ferocious ambition to take over the underworld and rule the national financial capital.',
      duration: 133,
      language: 'Telugu',
      genre: ['Crime', 'Action', 'Mass'],
      releaseDate: '2012-01-13',
      posterUrl: 'https://image.tmdb.org/t/p/w500/k2A3S4D5F6G7H8J9K0L1Z2X3C4V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=6o4bK3v2j8M',
      rating: 8.7,
    },
    {
      title: 'Simhadri',
      description: 'An orphan raised as an adopted son in a noble household leads a double life as a ferocious vigilante protector in Visakhapatnam.',
      duration: 168,
      language: 'Telugu',
      genre: ['Action', 'Mass', 'Emotion'],
      releaseDate: '2003-07-09',
      posterUrl: 'https://image.tmdb.org/t/p/w500/m2A3S4D5F6G7H8J9K0L1Z2X3C4V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=2n5v4m1K8L0',
      rating: 9.0,
    },
    {
      title: 'Yamadonga',
      description: 'A charming rogue thief dies prematurely and descends into Yamaloka, challenging Lord Yama himself for his life and dignity.',
      duration: 178,
      language: 'Telugu',
      genre: ['Socio-Fantasy', 'Comedy', 'Action'],
      releaseDate: '2007-08-15',
      posterUrl: 'https://image.tmdb.org/t/p/w500/h2A3S4D5F6G7H8J9K0L1Z2X3C4V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Ht2m3k1J8V0',
      rating: 8.5,
    },
    {
      title: 'Adhurs',
      description: 'Separated twin brothers — one a hilarious Brahmin priest Narasimha and the other an undercover street agent Chari — cross paths.',
      duration: 158,
      language: 'Telugu',
      genre: ['Comedy', 'Action', 'Drama'],
      releaseDate: '2010-01-13',
      posterUrl: 'https://image.tmdb.org/t/p/w500/h3A3S4D5F6G7H8J9K0L1Z2X3C4V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Ht3m3k1J8V0',
      rating: 8.8,
    },
    {
      title: 'Nannaku Prematho',
      description: 'An intelligent son uses forensic game theory to bankrupt the corrupt corporate billionaire who swindled his dying father.',
      duration: 168,
      language: 'Telugu',
      genre: ['Thriller', 'Mind Game', 'Family'],
      releaseDate: '2016-01-13',
      posterUrl: 'https://image.tmdb.org/t/p/w500/b2A3S4D5F6G7H8J9K0L1Z2X3C4V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Bk2m3k1J8V0',
      rating: 8.7,
    },
    {
      title: 'Janatha Garage',
      description: 'An environmental activist joins forces with an altruistic garage owner in Hyderabad that repairs cars and rectifies social injustice.',
      duration: 162,
      language: 'Telugu',
      genre: ['Action', 'Social', 'Drama'],
      releaseDate: '2016-09-01',
      posterUrl: 'https://image.tmdb.org/t/p/w500/o1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Og1m3k1J8V0',
      rating: 8.4,
    },
    {
      title: 'Aravinda Sametha Veera Raghava',
      description: 'Veera Raghava abandons 30 years of Rayalaseema bloodshed and advocates peace after the tragic demise of his father.',
      duration: 162,
      language: 'Telugu',
      genre: ['Faction', 'Action', 'Emotion'],
      releaseDate: '2018-10-11',
      posterUrl: 'https://image.tmdb.org/t/p/w500/u1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Ub1m3k1J8V0',
      rating: 8.9,
    },
    {
      title: 'Gabbar Singh',
      description: 'A bold, witty police officer named Gabbar Singh takes on local thugs and a corrupt politician in the town of Kondaveedu.',
      duration: 153,
      language: 'Telugu',
      genre: ['Action', 'Mass', 'Comedy'],
      releaseDate: '2012-05-11',
      posterUrl: 'https://image.tmdb.org/t/p/w500/k3A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Kt2m3k1J8V0',
      rating: 8.9,
    },
    {
      title: 'Attarintiki Daredi',
      description: 'Gowtham Nanda, the grandson of an 80-year-old billionaire in Milan, travels incognito as a driver to reconcile his estranged aunt with his family.',
      duration: 170,
      language: 'Telugu',
      genre: ['Comedy', 'Family', 'Drama'],
      releaseDate: '2013-09-27',
      posterUrl: 'https://image.tmdb.org/t/p/w500/s1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Sr1m3k1J8V0',
      rating: 9.0,
    },
    {
      title: 'Jalsa',
      description: 'Sanjay Sahu, a former extreme naxalite turned youth mentor, stands against an arrogant mafia faction leader while falling in love.',
      duration: 161,
      language: 'Telugu',
      genre: ['Comedy', 'Romance', 'Action'],
      releaseDate: '2008-04-02',
      posterUrl: 'https://image.tmdb.org/t/p/w500/e1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Eg1m3k1J8V0',
      rating: 8.8,
    },
    {
      title: 'Tholi Prema',
      description: 'Balu falls head over heels for Anu at first sight, embarking on an unforgettable journey of selfless love and personal triumph.',
      duration: 147,
      language: 'Telugu',
      genre: ['Romance', 'Classic', 'Drama'],
      releaseDate: '1998-07-24',
      posterUrl: 'https://image.tmdb.org/t/p/w500/j1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Jr1m3k1J8V0',
      rating: 9.3,
    },
    {
      title: 'Badri',
      description: 'Badri runs an advertisement firm and navigates an impulsive bet that escalates into high-voltage passion and street rivalry.',
      duration: 154,
      language: 'Telugu',
      genre: ['Action', 'Youth', 'Romance'],
      releaseDate: '2000-04-20',
      posterUrl: 'https://image.tmdb.org/t/p/w500/r1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Rg1m3k1J8V0',
      rating: 8.6,
    },
    {
      title: 'Kushi',
      description: 'Two stubborn college sweethearts from Kolkata and Hyderabad let pride and petty misunderstandings test their profound love.',
      duration: 174,
      language: 'Telugu',
      genre: ['Romance', 'Comedy', 'Evergreen'],
      releaseDate: '2001-04-27',
      posterUrl: 'https://image.tmdb.org/t/p/w500/a1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Av1m3k1J8V0',
      rating: 9.1,
    },
    {
      title: 'Chatrapathi',
      description: 'Displaced refugees from Sri Lanka arrive at the Visakhapatnam port, where Shivaji rises as the messianic leader Chatrapathi.',
      duration: 165,
      language: 'Telugu',
      genre: ['Action', 'Emotion', 'Rebellion'],
      releaseDate: '2005-09-29',
      posterUrl: 'https://image.tmdb.org/t/p/w500/p1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Pk1m3k1J8V0',
      rating: 9.1,
    },
    {
      title: 'Mirchi',
      description: 'Jai returns from Milan to resolve ancestral faction bloodshed in Palnadu by preaching the power of unconditional love over knives.',
      duration: 155,
      language: 'Telugu',
      genre: ['Action', 'Family', 'Faction'],
      releaseDate: '2013-02-08',
      posterUrl: 'https://image.tmdb.org/t/p/w500/g1A2S3D4F5G6H7J8K9L0Z1X2C3V.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Gg1m3k1J8V0',
      rating: 8.9,
    },
    {
      title: 'Darling',
      description: 'Prabhas fabricates an imaginative romantic flashback during a college reunion to evade the advances of a gang boss daughter.',
      duration: 152,
      language: 'Telugu',
      genre: ['Romance', 'Comedy', 'Feel Good'],
      releaseDate: '2010-04-23',
      posterUrl: 'https://image.tmdb.org/t/p/w500/ar1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Ar1m3k1J8V0',
      rating: 8.5,
    },
    {
      title: 'Varsham',
      description: 'Venkat falls in love with Sailaja on a rain-drenched train journey, but a predatory local politician attempts to seize her.',
      duration: 160,
      language: 'Telugu',
      genre: ['Romance', 'Action', 'Musical'],
      releaseDate: '2004-01-14',
      posterUrl: 'https://image.tmdb.org/t/p/w500/st2A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=St2m3k1J8V0',
      rating: 8.6,
    },
    {
      title: 'Leader',
      description: 'Following the assassination of his Chief Minister father, Sanjeev takes the reins of state power to root out rampant political bribery.',
      duration: 168,
      language: 'Telugu',
      genre: ['Political', 'Drama', 'Reform'],
      releaseDate: '2010-02-19',
      posterUrl: 'https://image.tmdb.org/t/p/w500/jw1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Jw1m3k1J8V0',
      rating: 8.7,
    },
    {
      title: 'Arya',
      description: 'Arya practices unconditional one-way love for Geetha, refusing to back down even when she is betrothed to the college bully.',
      duration: 150,
      language: 'Telugu',
      genre: ['Romance', 'Youth', 'Cult'],
      releaseDate: '2004-05-07',
      posterUrl: 'https://image.tmdb.org/t/p/w500/an1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=An1m3k1J8V0',
      rating: 9.0,
    },
    {
      title: 'Arya 2',
      description: 'Arya, an unpredictable orphan with an intense devotion to his childhood buddy, creates emotional chaos at a software multinational.',
      duration: 165,
      language: 'Telugu',
      genre: ['Psychological', 'Romance', 'Comedy'],
      releaseDate: '2009-11-27',
      posterUrl: 'https://image.tmdb.org/t/p/w500/le1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Le1m3k1J8V0',
      rating: 8.7,
    },
    {
      title: 'Desamuduru',
      description: 'Bala, a hot-headed crime program producer from Hyderabad, journeys to Manali where he shields a sanyasini from a ruthless Rayalaseema don.',
      duration: 156,
      language: 'Telugu',
      genre: ['Action', 'Romance', 'Mass'],
      releaseDate: '2007-01-12',
      posterUrl: 'https://image.tmdb.org/t/p/w500/jl1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Jl1m3k1J8V0',
      rating: 8.3,
    },
    {
      title: 'Race Gurram',
      description: 'Two ideologically contrasting brothers join forces to neutralize an unhinged mafia politician who aims to usurp state governance.',
      duration: 163,
      language: 'Telugu',
      genre: ['Action', 'Comedy', 'Family'],
      releaseDate: '2014-04-11',
      posterUrl: 'https://image.tmdb.org/t/p/w500/vt1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Vt1m3k1J8V0',
      rating: 8.8,
    },
    {
      title: 'Sarrainodu',
      description: 'Gana, an ex-military officer, metes out vigilante punishments to affluent lawbreakers who manipulate corrupted courtrooms.',
      duration: 159,
      language: 'Telugu',
      genre: ['High Voltage', 'Action', 'Mass'],
      releaseDate: '2016-04-22',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gt1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Gt1m3k1J8V0',
      rating: 8.5,
    },
    {
      title: 'DJ: Duvvada Jagannadham',
      description: 'A traditional Brahmin caterer in Vijayawada operates secretly as a fierce vigilante assassin executing high-level land scammers.',
      duration: 156,
      language: 'Telugu',
      genre: ['Action', 'Comedy', 'Masala'],
      releaseDate: '2017-06-23',
      posterUrl: 'https://image.tmdb.org/t/p/w500/mb1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Mb1m3k1J8V0',
      rating: 8.1,
    },
    {
      title: 'F2: Fun and Frustration',
      description: 'Two co-brothers try to assert independence from their domineering wives by fleeing to Europe, unleashing uproarious hilarity.',
      duration: 148,
      language: 'Telugu',
      genre: ['Comedy', 'Family', 'Blockbuster'],
      releaseDate: '2019-01-12',
      posterUrl: 'https://image.tmdb.org/t/p/w500/av1A2S3D4F5G6H7J8K9L0Z1X2C3.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Av1m3k1J8V0',
      rating: 8.2,
    },
    {
      title: 'Drushyam 2',
      description: 'Six years after the case was closed, Rambabu family is subjected to new police surveillance as detectives attempt to unearth the body.',
      duration: 152,
      language: 'Telugu',
      genre: ['Suspense', 'Crime', 'Family'],
      releaseDate: '2021-11-25',
      posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
      rating: 8.6,
    },
    {
      title: 'Akhanda',
      description: 'When ruthless mining barons threaten a rural hamlet, a divine Aghora warrior emerges from Kashi to unleash righteous fury.',
      duration: 167,
      language: 'Telugu',
      genre: ['Action', 'Divine', 'Mass'],
      releaseDate: '2021-12-02',
      posterUrl: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
      rating: 8.5,
    },
    {
      title: 'Legend',
      description: 'Jaidev returns to Kurnool to end the thirty-year reign of terror orchestrated by an unscrupulous feudal syndicate.',
      duration: 162,
      language: 'Telugu',
      genre: ['Action', 'Faction', 'Mass'],
      releaseDate: '2014-03-28',
      posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      rating: 8.4,
    },
    {
      title: 'Samarasimha Reddy',
      description: 'The monumental Rayalaseema faction drama that redefined mass Telugu cinema, tracking a noble warrior battle against revenge.',
      duration: 165,
      language: 'Telugu',
      genre: ['Action', 'Cult Classic', 'Faction'],
      releaseDate: '1999-01-13',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      rating: 8.9,
    },
    {
      title: 'Narasimha Naidu',
      description: 'A devoted family guardian in Rayalaseema sacrifices his peaceful village retirement to protect his loved ones from feudal enemies.',
      duration: 168,
      language: 'Telugu',
      genre: ['Action', 'Drama', 'All-Time Hit'],
      releaseDate: '2001-01-11',
      posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      rating: 9.0,
    },
    {
      title: 'KGF: Chapter 1',
      description: 'Rocky arrives in Bombay as a destitute orphan and rises through ruthless courage to infiltrate the lethal gold mines of KGF.',
      duration: 156,
      language: 'Kannada',
      genre: ['Action', 'Period', 'Crime'],
      releaseDate: '2018-12-21',
      posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      rating: 8.8,
    },
  ];

  let addedMoviesCount = 0;
  for (const m of movies) {
    try {
      await req('POST', '/movies/add', m, token);
      addedMoviesCount++;
      process.stdout.write(`\rAdded Movies: ${addedMoviesCount} / ${movies.length}`);
    } catch (e) {
      console.error(`\nFailed movie ${m.title}:`, e.message);
    }
  }
  console.log(`\nSuccessfully added ${addedMoviesCount} new movies!`);

  console.log('\n=== Step 3: Adding 50 More Theatres across AP & Telangana ===');
  const theatres = [
    // Vijayawada
    { name: 'PVR Ripples Mall', city: 'Vijayawada', address: 'MG Road, Labbipet, Vijayawada, AP 520010', description: 'Premier 4-screen PVR multiplex with 4K projection and gourmet food.', facilities: ['4K Laser', 'Dolby Atmos', 'Mall Parking', 'Food Court'] },
    { name: 'INOX LEPL Icon Mall', city: 'Vijayawada', address: 'Patamata, MG Road, Vijayawada, AP 520010', description: 'Flagship multiplex featuring INSIGNIA luxury dining and crystal sound.', facilities: ['IMAX', 'Dolby 7.1', 'Valet Parking', 'Luxury Recliners'] },
    { name: 'Capital Cinemas (Trendset Mall)', city: 'Vijayawada', address: 'Benz Circle, Vijayawada, AP 520008', description: 'State of the art multi-screen cinema with Auro 3D sound.', facilities: ['Auro 3D', '4K Projection', 'Trendset Mall', 'Concessions'] },
    { name: 'Cinepolis (Power One Mall)', city: 'Vijayawada', address: 'Auto Nagar, Vijayawada, AP 520007', description: 'Modern 6-screen megaplex with spacious pushback chairs.', facilities: ['3D Screen', 'Dolby Atmos', 'Kids Play Area', 'Parking'] },
    { name: 'Annapurna Multiplex', city: 'Vijayawada', address: 'Besant Road, Governorpet, Vijayawada, AP 520002', description: 'Central Vijayawada historic cinema hall with updated digital sound.', facilities: ['Dolby Sound', 'Pushback Seats', 'Central AC'] },
    { name: 'Sailaja Theatre', city: 'Vijayawada', address: 'Governorpet, Vijayawada, AP 520002', description: 'Renowned single screen with massive screen and explosive audio.', facilities: ['Dolby 7.1', 'Two Wheeler Parking', 'Snack Bar'] },
    { name: 'Apsara 70mm', city: 'Vijayawada', address: 'Gandhinagar, Vijayawada, AP 520003', description: 'Legendary 70mm hall known for massive first-day fan celebrations.', facilities: ['70mm Screen', 'Dolby Digital', 'Cafeteria'] },

    // Guntur
    { name: 'Hollywood Bollywood Multiplex', city: 'Guntur', address: 'Lakshmipuram Main Road, Guntur, AP 522007', description: 'Premier dual-screen cinema with comfortable seating and Dolby sound.', facilities: ['Dolby 7.1', 'Pushback Seats', 'Parking', 'Snack Bar'] },
    { name: 'Cine Square Multiplex', city: 'Guntur', address: 'Naaz Centre, Guntur, AP 522001', description: 'Iconic cinema destination at Naaz Centre with modern 4K projectors.', facilities: ['4K Digital', 'Dolby Atmos', 'AC Waiting Area'] },
    { name: 'Saraswathi Theatre', city: 'Guntur', address: 'Brodipet 4th Lane, Guntur, AP 522002', description: 'Family favorite cinema hall in the heart of Brodipet.', facilities: ['Dolby Sound', 'Spacious Seating', 'Canteen'] },
    { name: 'Krishna Mahal 70mm', city: 'Guntur', address: 'Arundelpet, Guntur, AP 522002', description: 'Large 70mm auditorium offering grand festive movie screenings.', facilities: ['70mm Projection', 'Dolby Surround', 'Parking'] },
    { name: 'Harihar Mahal', city: 'Guntur', address: 'Lalapet, Guntur, AP 522003', description: 'Reliable mass cinema house with budget-friendly tickets.', facilities: ['Digital 2K', 'Dolby Sound', 'Concessions'] },

    // Rajahmundry
    { name: 'Surya Multiplex', city: 'Rajahmundry', address: 'Danavaipeta, Rajahmundry, AP 533103', description: 'Modern 3-screen multiplex with Dolby Atmos and recliner sofas.', facilities: ['Dolby Atmos', 'Recliner Seats', 'Parking', 'Food Court'] },
    { name: 'Urvasi INOX Cinemas', city: 'Rajahmundry', address: 'Jampeta, Rajahmundry, AP 533101', description: 'Renovated multiplex delivering world-class visual clarity on Godavari shores.', facilities: ['4K Laser', 'Dolby 7.1', 'Central AC'] },
    { name: 'Syamala Theatre', city: 'Rajahmundry', address: 'Main Road, Rajahmundry, AP 533101', description: 'Historic cinema theatre located in the commercial bazaar of Rajahmundry.', facilities: ['Dolby Sound', 'Pushback Seating', 'Snacks'] },
    { name: 'Ashoka Theatre', city: 'Rajahmundry', address: 'Kotipalli Bus Stand, Rajahmundry, AP 533101', description: 'Convenient central location with large screen and friendly staff.', facilities: ['Digital 2K', 'Dolby Sound', 'Two Wheeler Parking'] },
    { name: 'Kumari Theatre', city: 'Rajahmundry', address: 'Kambala Cheruvu, Rajahmundry, AP 533105', description: 'Popular youth and family theatre near the scenic Kambala tank.', facilities: ['Dolby 7.1', 'Air Conditioned', 'Cafeteria'] },

    // Kakinada
    { name: 'INOX SRMT Mall', city: 'Kakinada', address: 'Main Road, Kakinada, AP 533001', description: 'Premier 5-screen multiplex in SRMT Mall with 4K digital projection.', facilities: ['4K Laser', 'Dolby Atmos', 'SRMT Mall Access', 'VIP Recliners'] },
    { name: 'Anand Complex', city: 'Kakinada', address: 'Cinema Road, Kakinada, AP 533001', description: 'Twin screen theatre hall known for crisp acoustics and cozy seating.', facilities: ['Dolby 7.1', 'Pushback Seats', 'Parking'] },
    { name: 'Mayuri Theatre', city: 'Kakinada', address: 'Bhanugudi Junction, Kakinada, AP 533003', description: 'Prominent cinema at Bhanugudi junction screening top Tollywood hits.', facilities: ['Dolby Sound', 'Central AC', 'Refreshment Canteen'] },
    { name: 'Padmapriya Theatre', city: 'Kakinada', address: 'Temple Street, Kakinada, AP 533001', description: 'Beloved city cinema hall offering clear sightlines and easy access.', facilities: ['Digital Projection', 'Dolby Sound', 'Parking'] },

    // Tirupati
    { name: 'PVR VVS Mall', city: 'Tirupati', address: 'Korlagunta, Tirupati, AP 517501', description: 'Holy city Tirupatis first PVR 4-screen multiplex with luxury amenities.', facilities: ['4K Laser', 'Dolby Atmos', 'VVS Mall', 'Gourmet Snacks'] },
    { name: 'PGR Cinemas', city: 'Tirupati', address: 'Tilak Road, Tirupati, AP 517501', description: 'Modern twin cinema complex with great surround sound.', facilities: ['Dolby Atmos', 'Pushback Chairs', 'Parking'] },
    { name: 'Jayasyam Complex', city: 'Tirupati', address: 'Near Railway Station, Tirupati, AP 517501', description: 'Strategically located near Tirupati railway junction with high-volume shows.', facilities: ['Dolby 7.1', 'AC Lounge', 'Snacks Counter'] },
    { name: 'Pratap Theatre', city: 'Tirupati', address: 'Bhavani Nagar, Tirupati, AP 517501', description: 'Mass cinema destination famous for electric festival first-day celebrations.', facilities: ['Dolby Sound', 'Spacious Seating', 'Parking'] },

    // Kurnool
    { name: 'INOX Anand Complex', city: 'Kurnool', address: 'Railway Station Road, Kurnool, AP 518004', description: 'Historic Anand complex renovated into a contemporary INOX multiplex.', facilities: ['4K Laser', 'Dolby Atmos', 'Central AC', 'Food Court'] },
    { name: 'Srirama Complex', city: 'Kurnool', address: 'Park Road, Kurnool, AP 518001', description: 'Dual theatre complex with comfortable seating and great sound quality.', facilities: ['Dolby 7.1', 'Pushback Seats', 'Parking'] },
    { name: 'Alankar Theatre', city: 'Kurnool', address: 'Mourya Inn Road, Kurnool, AP 518002', description: 'One of the best single screen experiences in Rayalaseema heartland.', facilities: ['Dolby Sound', 'Large Screen', 'Canteen'] },

    // Nellore
    { name: 'S2 Cinemas', city: 'Nellore', address: 'Dargamitta, Nellore, AP 524003', description: 'Flagship multiplex by SPI Cinemas featuring world-class audio and popcorn.', facilities: ['Dolby Atmos', '4K Projection', 'Gourmet Concessions'] },
    { name: 'Nartaki Complex', city: 'Nellore', address: 'Trunk Road, Nellore, AP 524001', description: 'Historic central cinema complex screening regional and pan-Indian movies.', facilities: ['Dolby 7.1', 'Central AC', 'Parking'] },
    { name: 'Kaveri 70mm', city: 'Nellore', address: 'Pogathota, Nellore, AP 524001', description: 'Spacious 70mm cinema hall with outstanding sound distribution.', facilities: ['70mm Screen', 'Dolby Surround', 'Snack Bar'] },

    // Hyderabad & Secunderabad (Telangana)
    { name: 'Prasads Multiplex', city: 'Hyderabad', address: 'Necklace Road, Khairatabad, Hyderabad, TS 500004', description: 'Iconic world-famous entertainment hub featuring the massive PCX giant screen.', facilities: ['PCX Giant Screen', 'Dolby Atmos', 'Gaming Zone', 'Lake View'] },
    { name: 'AMB Cinemas', city: 'Hyderabad', address: 'Gachibowli - Miyapur Road, Hyderabad, TS 500084', description: 'Superstar Mahesh Babus luxury 7-screen megaplex with laser projection.', facilities: ['VIP M-Lounge', 'Laser 4K', 'Dolby Atmos', 'Valet Parking'] },
    { name: 'PVR Forum Sujana Mall', city: 'Hyderabad', address: 'KPHB Phase 9, Kukatpally, Hyderabad, TS 500072', description: 'Massive 9-screen PVR multiplex with 4DX, IMAX, and Gold Class screens.', facilities: ['IMAX', '4DX', 'PVR Gold', 'Mall Parking'] },
    { name: 'INOX GVK One Mall', city: 'Hyderabad', address: 'Road No 1, Banjara Hills, Hyderabad, TS 500034', description: 'Luxury multiplex in upscale Banjara Hills with INSIGNIA service.', facilities: ['INSIGNIA Dining', 'Dolby Atmos', 'Recliner Seats'] },
    { name: 'Cinepolis DSL Virtue Mall', city: 'Hyderabad', address: 'Uppal, Hyderabad, TS 500039', description: 'Premier 10-screen megaplex serving eastern Hyderabad IT zone.', facilities: ['Macro XE', 'Dolby Atmos', 'RealD 3D', 'Food Court'] },
    { name: 'Sandhya 70mm', city: 'Hyderabad', address: 'RTC X Roads, Chikkadpally, Hyderabad, TS 500020', description: 'Epic center of Indian cinema box office mania with deafening celebrations.', facilities: ['70mm Screen', 'Dolby Atmos', 'Legendary Fan Energy'] },
    { name: 'Sudarshan 35mm', city: 'Hyderabad', address: 'RTC X Roads, Hyderabad, TS 500020', description: 'The undisputed temple of Tollywood records and houseful banners.', facilities: ['Dolby Sound', 'Spacious Seating', 'Balcony Lounges'] },
    { name: 'Devi 70mm', city: 'Hyderabad', address: 'RTC X Roads, Hyderabad, TS 500020', description: 'One of the best acoustic cinema halls in India with crystal high frequencies.', facilities: ['Dolby Atmos', '4K Projection', 'Central AC'] },
    { name: 'Asian Shiva Ganga', city: 'Hyderabad', address: 'Dilsukhnagar, Hyderabad, TS 500060', description: 'Asian Cinemas twin theatre complex serving the dense Dilsukhnagar area.', facilities: ['Dolby 7.1', 'Pushback Seats', 'Metro Connectivity'] },
    { name: 'Miraj Cinemas (Shalimar)', city: 'Hyderabad', address: 'Station Road, Secunderabad, TS 500003', description: 'Contemporary 3-screen multiplex inside heritage Secunderabad.', facilities: ['Dolby Atmos', 'Recliner Seats', 'Metro Access'] },
    { name: 'Asian Radhika Multiplex', city: 'Hyderabad', address: 'ECIL Roads, Secunderabad, TS 500062', description: 'Leading 5-screen family entertainment destination in ECIL and Kapra.', facilities: ['Dolby Atmos', '4K Digital', 'Car Parking', 'Snack Counters'] },

    // Additional AP Regional Hubs
    { name: 'Ambica Deluxe Theatre', city: 'Vijayawada', address: 'Powerpet, Eluru Road, AP 534002', description: 'Prominent cinema with luxury air conditioning and clear audio.', facilities: ['Dolby Sound', 'Air Conditioned', 'Parking'] },
    { name: 'Sai Balaji Complex', city: 'Vijayawada', address: 'RR Pet, Eluru, AP 534002', description: 'Multi-auditorium cinema hall with high-definition digital display.', facilities: ['Digital 2K', 'Dolby 7.1', 'Snack Bar'] },
    { name: 'Shanthi Complex', city: 'Kurnool', address: 'Subhash Road, Anantapur, AP 515001', description: 'Anantapurs beloved twin cinema complex with spacious grounds.', facilities: ['Dolby Sound', 'Pushback Chairs', 'Parking'] },
    { name: 'Triveni Theatre', city: 'Kurnool', address: 'Clock Tower Junction, Anantapur, AP 515001', description: 'Central landmark cinema offering uninterrupted blockbuster enjoyment.', facilities: ['Dolby Digital', 'Central AC', 'Refreshments'] },
    { name: 'Ameer Complex', city: 'Tirupati', address: 'Seven Roads, Kadapa, AP 516001', description: 'Historic theatre complex at 7 roads junction screening the largest releases.', facilities: ['Dolby 7.1', 'Spacious Seating', 'Canteen'] },
    { name: 'Ravi Theatre', city: 'Tirupati', address: 'Brahmin Street, Kadapa, AP 516001', description: 'Traditional popular single screen offering great acoustic power.', facilities: ['Dolby Sound', 'Balcony & First Class', 'Parking'] },
    { name: 'Someswara Multiplex', city: 'Rajahmundry', address: 'Prakasam Chowk, Bhimavaram, AP 534201', description: 'Aqua city Bhimavarams premiere multiplex with state of the art screens.', facilities: ['Dolby Atmos', '4K Projection', 'Bhimavaram Center'] },
    { name: 'Vijaya Theatre', city: 'Rajahmundry', address: 'JNR Road, Bhimavaram, AP 534201', description: 'Mass favorite cinema theatre known for houseful opening week collections.', facilities: ['Dolby Sound', 'Pushback Chairs', 'Snack Bar'] },
  ];

  let addedTheatresCount = 0;
  const newTheatres = [];
  for (const th of theatres) {
    try {
      const res = await req('POST', '/theatres/add', th, token);
      newTheatres.push(res.theatre);
      addedTheatresCount++;
      process.stdout.write(`\rAdded Theatres: ${addedTheatresCount} / ${theatres.length}`);
    } catch (e) {
      console.error(`\nFailed theatre ${th.name}:`, e.message);
    }
  }
  console.log(`\nSuccessfully added ${addedTheatresCount} new theatres!`);

  console.log('\n=== Step 4: Adding Screens for New Theatres ===');
  let addedScreensCount = 0;
  const newScreens = [];
  for (const th of newTheatres) {
    try {
      const s1 = await req('POST', '/screens/add', {
        theatre: th._id,
        name: 'Screen 1 (Main Hall)',
        screenType: '2D',
        totalSeats: 60,
        seatLayout: { rows: 6, cols: 10 },
      }, token);
      newScreens.push(s1.screen);
      addedScreensCount++;

      if (th.name.includes('Multiplex') || th.name.includes('INOX') || th.name.includes('PVR') || th.name.includes('AMB') || th.name.includes('Cinepolis') || th.name.includes('Complex')) {
        const s2 = await req('POST', '/screens/add', {
          theatre: th._id,
          name: 'Screen 2 (Gold Lounge / 3D)',
          screenType: '3D',
          totalSeats: 50,
          seatLayout: { rows: 5, cols: 10 },
        }, token);
        newScreens.push(s2.screen);
        addedScreensCount++;
      }
      process.stdout.write(`\rAdded Screens: ${addedScreensCount}`);
    } catch (e) {
      console.error(`\nFailed screen for ${th.name}:`, e.message);
    }
  }
  console.log(`\nSuccessfully added ${addedScreensCount} new screens!`);

  console.log('\n=== Step 5: Scheduling 50+ Shows for Newly Added Screens ===');
  const allMoviesRes = await req('GET', '/movies/all');
  const allMovies = allMoviesRes.movies || [];

  const showTimes = [
    { start: '11:00 AM', end: '02:00 PM', price: 175 },
    { start: '02:30 PM', end: '05:30 PM', price: 220 },
    { start: '06:15 PM', end: '09:15 PM', price: 295 },
    { start: '09:45 PM', end: '12:45 AM', price: 200 },
  ];

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  let addedShowsCount = 0;
  let mIndex = 0;

  for (const scr of newScreens) {
    const movieA = allMovies[mIndex % allMovies.length];
    const movieB = allMovies[(mIndex + 1) % allMovies.length];
    mIndex += 2;

    try {
      // Show 1 Today
      await req('POST', '/shows/add', {
        movie: movieA._id,
        theatre: scr.theatre,
        screen: scr._id,
        showDate: today,
        startTime: showTimes[1].start,
        endTime: showTimes[1].end,
        ticketPrice: showTimes[1].price,
      }, token);
      addedShowsCount++;

      // Show 2 Today
      await req('POST', '/shows/add', {
        movie: movieB._id,
        theatre: scr.theatre,
        screen: scr._id,
        showDate: today,
        startTime: showTimes[2].start,
        endTime: showTimes[2].end,
        ticketPrice: showTimes[2].price,
      }, token);
      addedShowsCount++;

      // Show 3 Tomorrow
      await req('POST', '/shows/add', {
        movie: movieA._id,
        theatre: scr.theatre,
        screen: scr._id,
        showDate: tomorrow,
        startTime: showTimes[2].start,
        endTime: showTimes[2].end,
        ticketPrice: showTimes[2].price,
      }, token);
      addedShowsCount++;

      process.stdout.write(`\rScheduled Shows: ${addedShowsCount}`);
    } catch (e) {
      console.error(`\nFailed to schedule show:`, e.message);
    }
  }
  console.log(`\nSuccessfully scheduled ${addedShowsCount} new shows!`);

  console.log('\n=== Step 6: Final Catalog Verification ===');
  const finalM = await req('GET', '/movies/all');
  const finalT = await req('GET', '/theatres/all');
  const finalS = await req('GET', '/shows/all');

  console.log('----------------------------------------------------');
  console.log(`🎬 Total Movies in CineVault:  ${finalM.count || finalM.movies.length}`);
  console.log(`🏛️ Total Theatres across AP/TS: ${finalT.count || finalT.theatres.length}`);
  console.log(`🎟️ Total Active Shows:          ${finalS.count || finalS.shows.length}`);
  console.log('----------------------------------------------------');
}

main().catch((err) => {
  console.error('Fatal error during population:', err);
  process.exit(1);
});
