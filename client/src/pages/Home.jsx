import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    axios.get('/api/movies').then(res => setMovies(res.data)).catch(console.error);
  }, []);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    try {
      const res = await axios.post('/api/ai/recommend', { query: userMsg });
      const aiMsg = res.data.recommendations.map(r =>
        `${r.movie.title} — ${r.reasoning}`
      ).join('\n\n');
      setChatMessages(prev => [...prev, { role: 'ai', text: aiMsg || 'No recommendations found.' }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'AI service unavailable. Please try again later.' }]);
    }
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">CineMatch</h1>
        <p className="text-gray-400 mb-6">AI destekli film keşif ve biletleme platformu</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map(movie => (
            <Link key={movie._id} to={`/movies/${movie._id}`} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 ring-purple-500 transition">
              <div className="p-4">
                <h2 className="text-xl font-bold">{movie.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{movie.genre.join(', ')} • {movie.duration}dk</p>
                <p className="text-yellow-400 mt-1">★ {movie.rating}</p>
                <p className="text-gray-300 mt-2 line-clamp-2">{movie.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-96 bg-gray-800 rounded-lg shadow-xl border border-gray-600 flex flex-col" style={{ height: '500px' }}>
          <div className="bg-purple-600 p-3 rounded-t-lg flex justify-between items-center">
            <span>AI Advisor</span>
            <button onClick={() => setChatOpen(false)} className="text-white">✕</button>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`p-2 rounded ${msg.role === 'user' ? 'bg-purple-700 ml-8' : 'bg-gray-700 mr-8'}`}>
                <pre className="text-sm whitespace-pre-wrap font-sans">{msg.text}</pre>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-600 flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Nasıl bir film izlemek istersin?" className="flex-1 bg-gray-700 p-2 rounded text-sm" />
            <button onClick={sendChat} className="bg-purple-600 px-3 rounded hover:bg-purple-700">Send</button>
          </div>
        </div>
      )}
      <button onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 w-14 h-14 rounded-full shadow-lg hover:bg-purple-700 text-2xl">
        🤖
      </button>
    </div>
  );
}
