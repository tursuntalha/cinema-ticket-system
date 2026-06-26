import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import axios from 'axios';

export default function Profile() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [showQr, setShowQr] = useState(null);

  useEffect(() => {
    axios.get('/api/bookings/me').then(res => setBookings(res.data)).catch(console.error);
  }, []);

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-400">{user.email}</p>
        {user.role === 'admin' && <span className="bg-purple-600 px-2 py-0.5 rounded text-sm">Admin</span>}
        {user.preferredGenres?.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-400">Preferred genres: {user.preferredGenres.join(', ')}</p>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">My Bookings</h2>
      <div className="grid gap-4">
        {bookings.map(b => (
          <div key={b._id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-bold">{b.showtime?.movie?.title}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(b.showtime?.date).toLocaleDateString()} at {b.showtime?.time}
                </p>
                <p className="text-gray-400 text-sm">Seats: {b.seats.join(', ')}</p>
                <p className="text-purple-400">{b.totalPrice} TL</p>
              </div>
              <button onClick={() => setShowQr(showQr === b._id ? null : b._id)}
                className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-sm">
                {showQr === b._id ? 'Hide QR' : 'Show QR'}
              </button>
            </div>
            {showQr === b._id && b.qrCode && (
              <img src={b.qrCode} alt="QR" className="mt-4 mx-auto w-40 h-40" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
