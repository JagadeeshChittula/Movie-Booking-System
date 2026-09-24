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

async function scheduleTamil() {
  await mongoose.connect(URI);
  const Movie = mongoose.model('Movie', new mongoose.Schema({ title: String, language: String }));
  const Theatre = mongoose.model('Theatre', new mongoose.Schema({ name: String, city: String, isActive: Boolean }));
  const Screen = mongoose.model('Screen', new mongoose.Schema({ name: String, theatre: mongoose.Schema.Types.ObjectId, isActive: Boolean }));
  const Show = mongoose.model('Show', new mongoose.Schema({ theatre: mongoose.Schema.Types.ObjectId, screen: mongoose.Schema.Types.ObjectId, showDate: Date, startTime: String, isActive: Boolean }));

  const tamilTitles = ['Jailer 2', 'OM: Chapter 1 – Udhiram', 'Scene', 'Mookuthi Amman 2'];
  const movies = await Movie.find({ title: { $in: tamilTitles } });
  console.log('Tamil movies found:', movies.map(m => m.title));

  const theatres = await Theatre.find({ city: { $in: ['Chennai', 'Hyderabad', 'Visakhapatnam'] }, isActive: { $ne: false } });
  console.log('Theatres found:', theatres.length);

  const standardSlots = [
    { start: '10:30 AM', end: '01:30 PM' },
    { start: '02:00 PM', end: '05:00 PM' },
    { start: '06:00 PM', end: '09:00 PM' },
    { start: '09:30 PM', end: '12:30 AM' }
  ];

  const targetDates = [
    '2026-09-24',
    '2026-09-25',
    '2026-09-26',
    '2026-09-27',
    '2026-09-28'
  ];

  let scheduled = 0;
  for (const t of theatres) {
    const screens = await Screen.find({ theatre: t._id, isActive: { $ne: false } });
    for (const screen of screens) {
      for (const dateStr of targetDates) {
        const startOfDay = new Date(dateStr);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const existingShows = await Show.find({
          screen: screen._id,
          showDate: { $gte: startOfDay, $lte: endOfDay },
          isActive: true
        });
        const occupied = new Set(existingShows.map(s => s.startTime.trim()));
        const freeSlots = standardSlots.filter(s => !occupied.has(s.start));

        for (const slot of freeSlots) {
          const chosenMovie = movies[scheduled % movies.length];
          const payload = {
            movie: chosenMovie._id,
            theatre: t._id,
            screen: screen._id,
            showDate: dateStr,
            startTime: slot.start,
            endTime: slot.end,
            ticketPrice: 200
          };

          const res = await fetch(`${BASE_URL}/shows/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(payload)
          });

          if (res.status === 201) {
            scheduled++;
          }
        }
      }
    }
  }

  console.log(`Scheduled ${scheduled} shows for Tamil movies!`);
  await mongoose.disconnect();
}

scheduleTamil().catch(console.error);
