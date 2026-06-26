import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function MovieDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [showtimes, setShowtimes] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    axios.get(`/api/movies/${id}`)
      .then(res => {
        setData(res.data.movie);
        setShowtimes(res.data.showtimes.filter(s =>
          new Date(s.date).toISOString().split('T')[0] === filterDate
        ));
      })
      .catch(console.error);
  }, [id, filterDate]);

  const submitRating = async (score) => {
    setRating(score);
    try {
      await axios.post('/api/ai/rate', { movieId: id, score });
    } catch {}
  };

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
        <p className="text-gray-400 mb-2">{data.genre.join(', ')} • {data.duration}dk • {data.language}</p>
        <p className="text-yellow-400 text-xl mb-4">★ {data.rating}</p>
        <p className="text-gray-300 mb-4">{data.description}</p>
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => submitRating(s)}
              className={`w-10 h-10 rounded ${s <= rating ? 'bg-yellow-500' : 'bg-gray-600'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="bg-gray-700 p-2 rounded" />
      </div>

      <div className="grid gap-4">
        {showtimes.map(st => (
          <Link key={st._id} to={`/book/${st._id}`}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:ring-2 ring-purple-500">
            <div>
              <p className="text-lg font-bold">{st.hall?.name}</p>
              <p className="text-gray-400">{st.time}</p>
            </div>
            <div className="text-right">
              <p className="text-purple-400 text-lg">{st.price} TL</p>
              <p className="text-sm text-gray-400">{st.availableSeats?.length || 0} seats left</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
