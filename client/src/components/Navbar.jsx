import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-purple-400">CineMatch</Link>
      <div className="flex gap-4 items-center">
        <Link to="/" className="hover:text-purple-300">Movies</Link>
        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin" className="hover:text-purple-300">Admin</Link>}
            <Link to="/profile" className="hover:text-purple-300">{user.name}</Link>
            <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-purple-300">Login</Link>
            <Link to="/register" className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
