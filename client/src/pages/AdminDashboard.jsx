import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../components/AuthContext.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!user || user.role !== 'admin') { window.location.href = '/'; return; }
    axios.get('/api/admin/stats').then(res => setStats(res.data)).catch(console.error);
    axios.get('/api/movies').then(res => setMovies(res.data)).catch(console.error);
    axios.get('/api/halls').then(res => setHalls(res.data)).catch(console.error);
    axios.get('/api/showtimes').then(res => setShowtimes(res.data)).catch(console.error);
  }, [user]);

  const deleteMovie = async (id) => {
    if (!confirm('Delete this movie?')) return;
    await axios.delete(`/api/movies/${id}`);
    setMovies(prev => prev.filter(m => m._id !== id));
  };

  const deleteHall = async (id) => {
    if (!confirm('Delete this hall?')) return;
    await axios.delete(`/api/halls/${id}`);
    setHalls(prev => prev.filter(h => h._id !== id));
  };

  const deleteShowtime = async (id) => {
    if (!confirm('Delete this showtime?')) return;
    await axios.delete(`/api/showtimes/${id}`);
    setShowtimes(prev => prev.filter(s => s._id !== id));
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-4 mb-6">
        {['dashboard', 'movies', 'halls', 'showtimes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${tab === t ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700 capitalize`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold">{stats.totalMovies}</p><p className="text-gray-400">Movies</p></div>
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold">{stats.totalBookings}</p><p className="text-gray-400">Bookings</p></div>
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold">{stats.totalUsers}</p><p className="text-gray-400">Users</p></div>
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold text-green-400">{stats.totalRevenue} TL</p><p className="text-gray-400">Revenue</p></div>
        </div>
      )}

      {tab === 'movies' && (
        <div>
          <button onClick={() => {
            const title = prompt('Movie title?');
            if (title) axios.post('/api/movies', { title, description: prompt('Description?'), genre: prompt('Genres (comma-sep)?').split(','), duration: parseInt(prompt('Duration?')), rating: parseFloat(prompt('Rating?')) || 0 })
              .then(res => setMovies(prev => [...prev, res.data]));
          }} className="bg-green-600 px-4 py-2 rounded mb-4 hover:bg-green-700">+ Add Movie</button>
          <div className="grid gap-2">
            {movies.map(m => (
              <div key={m._id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                <div><p className="font-bold">{m.title}</p><p className="text-sm text-gray-400">{m.genre.join(', ')}</p></div>
                <button onClick={() => deleteMovie(m._id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'halls' && (
        <div>
          <button onClick={() => {
            const name = prompt('Hall name?');
            if (name) axios.post('/api/halls', { name, rows: parseInt(prompt('Rows?')), columns: parseInt(prompt('Columns?')) })
              .then(res => setHalls(prev => [...prev, res.data]));
          }} className="bg-green-600 px-4 py-2 rounded mb-4 hover:bg-green-700">+ Add Hall</button>
          <div className="grid gap-2">
            {halls.map(h => (
              <div key={h._id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                <div><p className="font-bold">{h.name}</p><p className="text-sm text-gray-400">{h.rows}x{h.columns} seats</p></div>
                <button onClick={() => deleteHall(h._id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'showtimes' && (
        <div>
          <button onClick={() => {
            const movieId = prompt('Movie ID?');
            const hallId = prompt('Hall ID?');
            const date = prompt('Date (YYYY-MM-DD)?');
            const time = prompt('Time (HH:MM)?');
            const price = parseInt(prompt('Price?'));
            if (movieId && hallId && date && time) axios.post('/api/showtimes', { movie: movieId, hall: hallId, date, time, price })
              .then(res => setShowtimes(prev => [...prev, res.data]));
          }} className="bg-green-600 px-4 py-2 rounded mb-4 hover:bg-green-700">+ Add Showtime</button>
          <div className="grid gap-2">
            {showtimes.map(s => (
              <div key={s._id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                <div><p className="font-bold">{s.movie?.title || s.movie}</p><p className="text-sm text-gray-400">{s.date?.slice(0,10)} at {s.time} — {s.price} TL</p></div>
                <button onClick={() => deleteShowtime(s._id)} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
