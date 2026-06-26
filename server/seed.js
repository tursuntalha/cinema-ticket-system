const mongoose = require('mongoose');
require('dotenv').config();
const Movie = require('./models/Movie');
const Hall = require('./models/Hall');
const Showtime = require('./models/Showtime');

const movies = [
  { title: 'Amélie', description: 'Montmartre\'da yaşayan genç bir kadının etrafındakilere küçük mutluluklar dağıtmasını anlatan sıcak bir hikaye.', genre: ['Romance', 'Comedy'], duration: 122, rating: 8.3, language: 'Fransızca' },
  { title: 'Inception', description: 'Bir hırsız, rüyalara girerek bilgi çalar. Son görevi ise bir düşünceyi yerleştirmektir.', genre: ['Science Fiction', 'Action', 'Thriller'], duration: 148, rating: 8.8, language: 'İngilizce' },
  { title: 'The Shawshank Redemption', description: 'Bir bankacının haksız yere hapse atılması ve umudunu kaybetmemesi üzerine ilham verici bir hikaye.', genre: ['Drama'], duration: 142, rating: 9.3, language: 'İngilizce' },
  { title: 'Spirited Away', description: 'Bir kız çocuğunun ruhlar dünyasında kaybolması ve ailesini kurtarmak için verdiği mücadele.', genre: ['Animation', 'Fantasy', 'Adventure'], duration: 125, rating: 8.6, language: 'Japonca' },
  { title: 'The Dark Knight', description: 'Batman, Joker adlı anarşist bir suçluyla yüzleşirken Gotham\'ın kaderi tehlikededir.', genre: ['Action', 'Crime', 'Drama'], duration: 152, rating: 9.0, language: 'İngilizce' },
  { title: 'Parasite', description: 'Zengin bir ailenin evine sızan yoksul bir ailenin gerilim dolu hikayesi.', genre: ['Drama', 'Thriller', 'Comedy'], duration: 132, rating: 8.5, language: 'Korece' },
  { title: 'Interstellar', description: 'Dünya\'nın sonunda, bir grup kaşif insanlığın kurtuluşu için uzayda yeni bir gezegen arar.', genre: ['Science Fiction', 'Drama', 'Adventure'], duration: 169, rating: 8.7, language: 'İngilizce' },
  { title: 'The Grand Budapest Hotel', description: 'Bir otel müdürünün maceralarını anlatan renkli ve tuhaf bir komedi.', genre: ['Comedy', 'Adventure', 'Drama'], duration: 99, rating: 8.1, language: 'İngilizce' },
  { title: 'Coco', description: 'Bir çocuğun ailesinin müzik yasağına karşı çıkarak ölüler diyarında çıktığı büyülü yolculuk.', genre: ['Animation', 'Adventure', 'Family'], duration: 105, rating: 8.4, language: 'İngilizce' },
  { title: 'Your Name', description: 'Birbirlerinin bedenine giren iki gencin zamanda yolculukla iç içe geçen hikayesi.', genre: ['Animation', 'Romance', 'Fantasy'], duration: 106, rating: 8.4, language: 'Japonca' }
];

const halls = [
  { name: 'Salon 1', rows: 8, columns: 12 },
  { name: 'Salon 2', rows: 6, columns: 10 },
  { name: 'Salon 3 (IMAX)', rows: 10, columns: 14 }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cinematch');
    console.log('Connected to MongoDB');

    await Movie.deleteMany({});
    await Hall.deleteMany({});
    await Showtime.deleteMany({});

    const createdMovies = await Movie.insertMany(movies);
    console.log(`Seeded ${createdMovies.length} movies`);

    const createdHalls = [];
    for (const h of halls) {
      const hall = await Hall.create(h);
      createdHalls.push(hall);
    }
    console.log(`Seeded ${createdHalls.length} halls`);

    const now = new Date();
    let showtimeCount = 0;
    for (const movie of createdMovies) {
      for (const hall of createdHalls) {
        const allSeats = hall.seats.flat();
        for (let day = 0; day < 3; day++) {
          const showDate = new Date(now);
          showDate.setDate(showDate.getDate() + day);
          showDate.setHours(0, 0, 0, 0);
          const times = ['10:30', '13:00', '15:30', '18:00', '20:30', '23:00'];
          const time = times[Math.floor(Math.random() * times.length)];
          await Showtime.create({
            movie: movie._id,
            hall: hall._id,
            date: showDate,
            time,
            price: hall.name.includes('IMAX') ? 200 : 120 + Math.floor(Math.random() * 40),
            availableSeats: allSeats,
            lockedSeats: []
          });
          showtimeCount++;
        }
      }
    }
    console.log(`Seeded ${showtimeCount} showtimes`);
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
