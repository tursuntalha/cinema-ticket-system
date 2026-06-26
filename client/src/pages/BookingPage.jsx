import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

let socket;

export default function BookingPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    socket = io('/', { withCredentials: true });

    axios.get(`/api/seats/${showtimeId}`).then(res => {
      setShowtime(res.data);
      setBookedSeats(res.data.lockedSeats || []);
    }).catch(console.error);

    socket.emit('join-showtime', showtimeId);
    socket.on('seat-held', ({ seat }) => setBookedSeats(prev => [...prev, seat]));
    socket.on('seat-released', ({ seat }) => setBookedSeats(prev => prev.filter(s => s !== seat)));
    socket.on('seats-booked', ({ seats }) => setBookedSeats(prev => [...prev, ...seats]));

    return () => { socket.disconnect(); };
  }, [showtimeId]);

  const toggleSeat = useCallback((seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev => {
      if (prev.includes(seat)) {
        socket.emit('release-seat', { showtimeId, seat });
        return prev.filter(s => s !== seat);
      }
      socket.emit('hold-seat', { showtimeId, seat });
      return [...prev, seat];
    });
  }, [showtimeId, bookedSeats]);

  const confirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/bookings', { showtimeId, seats: selectedSeats });
      setBookingResult(res.data);
      socket.emit('booking-confirmed', { showtimeId, seats: selectedSeats, booking: res.data });
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
    setLoading(false);
  };

  if (bookingResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-green-400 mb-4">Booking Confirmed!</h1>
          <p className="mb-2">Seats: {bookingResult.seats.join(', ')}</p>
          <p className="mb-4">Total: {bookingResult.totalPrice} TL</p>
          <img src={bookingResult.qrCode} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
          <button onClick={() => navigate('/profile')} className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">My Bookings</button>
        </div>
      </div>
    );
  }

  if (!showtime) return <div className="p-6">Loading seat map...</div>;

  const rows = showtime.hall?.seats || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select Your Seats</h1>
      <div className="flex gap-4 mb-6 text-sm">
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded"></span> Available</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-500 rounded"></span> Booked</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-blue-500 rounded"></span> Selected</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-500 rounded"></span> Held</span>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg overflow-x-auto">
        <svg viewBox={`0 0 ${showtime.hall?.columns * 55 || 600} ${rows.length * 55 + 60}`}
          className="w-full max-w-2xl mx-auto">
          <text x="50%" y="30" textAnchor="middle" fill="#888" fontSize="14">Screen</text>
          {rows.map((row, ri) => (
            row.map((seat, ci) => {
              const isBooked = bookedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              const fill = isBooked ? '#ef4444' : isSelected ? '#3b82f6' : '#22c55e';
              const cursor = isBooked ? 'not-allowed' : 'pointer';
              return (
                <g key={seat} onClick={() => toggleSeat(seat)} style={{ cursor }}>
                  <rect x={ci * 55 + 20} y={ri * 55 + 50} width={40} height={40} rx={4} fill={fill} opacity={isBooked ? 0.5 : 1} />
                  <text x={ci * 55 + 40} y={ri * 55 + 75} textAnchor="middle" fill="white" fontSize={10}>{seat}</text>
                </g>
              );
            })
          ))}
        </svg>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-lg flex justify-between items-center">
        <div>
          <p>Selected: <strong>{selectedSeats.join(', ') || 'None'}</strong></p>
          <p>Total: <strong className="text-purple-400">{selectedSeats.length * showtime.price} TL</strong></p>
        </div>
        <button onClick={confirmBooking} disabled={loading || selectedSeats.length === 0}
          className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50">
          {loading ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
