const path = require('path');
const mongoose = require(path.join(__dirname, 'node_modules/mongoose'));
require(path.join(__dirname, 'node_modules/dotenv')).config();

const Movie = require(path.join(__dirname, 'models/Movie'));
const Theatre = require(path.join(__dirname, 'models/Theatre'));
const Screen = require(path.join(__dirname, 'models/Screen'));
const Show = require(path.join(__dirname, 'models/Show'));

const SHOW_TIMES = [
  { start: '11:00 AM', end: '01:45 PM' },
  { start: '02:30 PM', end: '05:15 PM' },
  { start: '06:15 PM', end: '09:00 PM' },
  { start: '09:30 PM', end: '12:15 AM' },
];

function getUpcomingDates(days = 7) {
  const dates = [];
  const base = new Date('2026-09-23T00:00:00.000Z');
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

async function run() {
  await mongoose.connect(process.env.MONGODB);
  console.log('Connected to MongoDB');

  // 1. Update existing shows so their dates start from 2026-09-23 onwards
  const existingShows = await Show.find().populate('theatre');
  console.log(`Found ${existingShows.length} existing shows in DB`);

  const dates = getUpcomingDates(7);

  // Distribute existing shows across upcoming dates
  for (let i = 0; i < existingShows.length; i++) {
    const s = existingShows[i];
    const targetDate = dates[i % dates.length];
    await Show.findByIdAndUpdate(s._id, { showDate: targetDate, isActive: true });
  }
  console.log('Updated existing shows with fresh upcoming dates (2026-09-23 onwards)');

  // 2. Make sure all Srikakulam theatres have screens and shows for all top movies
  const srikakulamTheatres = await Theatre.find({ city: /srikakulam/i });
  console.log(`Found ${srikakulamTheatres.length} Srikakulam theatres`);

  const movies = await Movie.find({ isActive: true }).limit(30);

  let newShowsCount = 0;
  for (const theatre of srikakulamTheatres) {
    let screens = await Screen.find({ theatre: theatre._id });
    if (screens.length === 0) {
      const isMultiplex = /multiplex|complex/i.test(theatre.name);
      const s1 = await Screen.create({
        theatre: theatre._id,
        name: 'Screen 1 (Main 4K Dolby)',
        screenType: isMultiplex ? '3D' : '2D',
        totalSeats: 120,
        seatLayout: { rows: 10, cols: 12 },
      });
      screens = [s1];

      if (isMultiplex) {
        const s2 = await Screen.create({
          theatre: theatre._id,
          name: 'Screen 2 (IMAX Laser)',
          screenType: 'IMAX',
          totalSeats: 140,
          seatLayout: { rows: 10, cols: 14 },
        });
        screens.push(s2);
      }
    }

    // Check shows count for this theatre
    const theatreShows = await Show.find({ theatre: theatre._id, isActive: true });
    if (theatreShows.length < 6) {
      // Add shows for today and upcoming dates
      for (let dayIdx = 0; dayIdx < 4; dayIdx++) {
        const showDate = dates[dayIdx];
        const screen = screens[dayIdx % screens.length];
        const movie = movies[(theatre.name.length + dayIdx) % movies.length];

        for (const slot of SHOW_TIMES.slice(0, 3)) {
          const exists = await Show.findOne({
            theatre: theatre._id,
            screen: screen._id,
            showDate,
            startTime: slot.start,
          });

          if (!exists) {
            await Show.create({
              movie: movie._id,
              theatre: theatre._id,
              screen: screen._id,
              showDate,
              startTime: slot.start,
              endTime: slot.end,
              ticketPrice: screen.screenType === 'IMAX' ? 250 : 150,
              bookedSeats: ['A3', 'A4', 'C7'],
              isActive: true,
            });
            newShowsCount++;
          }
        }
      }
    }
  }

  console.log(`Added ${newShowsCount} new shows for Srikakulam theatres.`);

  const totalSklmShows = await Show.countDocuments({
    theatre: { $in: srikakulamTheatres.map(t => t._id) },
  });
  console.log(`Total shows now in Srikakulam: ${totalSklmShows}`);

  const totalAllShows = await Show.countDocuments();
  console.log(`Total shows overall: ${totalAllShows}`);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
