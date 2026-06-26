import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded" required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full p-2 mb-4 bg-gray-700 rounded" required />
        <button type="submit" className="w-full bg-purple-600 p-2 rounded hover:bg-purple-700">Register</button>
        <p className="mt-4 text-center text-gray-400">
          Have an account? <Link to="/login" className="text-purple-400">Login</Link>
        </p>
      </form>
    </div>
  );
}
