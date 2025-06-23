import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
      <div className="font-bold text-lg">Travel System</div>

      <ul className="flex space-x-4">
        {!user && (
          <li><Link to="/login">Login</Link></li>
        )}

        {user && (
          <>
            {(user.user_level === 'employee' || user.user_level === 'head') && (
              <>
                <li><Link to="/travel-order">My Travels</Link></li>
                <li><Link to="/rejected">Rejected Orders</Link></li>
              </>
            )}

            {(user.user_level === 'head' || user.user_level === 'director') && (
          <li><Link to="/approve">Pending Approvals</Link></li>
          )}

            {user.user_level === 'admin' && (
              <li><Link to="/admin-dashboard">Admin Panel</Link></li>
            )}

            <li>
              <button
                onClick={logout}
                className="hover:underline text-white"
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
