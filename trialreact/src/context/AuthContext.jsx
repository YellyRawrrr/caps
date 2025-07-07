import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  const fetchUser = async () => {
    try {
      const res = await axios.get('/user-info/');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      return null;
    }
  };

  
  const checkAuth = async () => {
    try {
      const res = await axios.get('/protected/');
      console.log('Provider: ' + res.data.authenticated);

      const userInfo = await fetchUser();
      setUser(userInfo);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const res1 = await axios.post('/refresh/');
          if (res1.status === 200) {
            const userInfo = await fetchUser();
            setUser(userInfo);
            
          }
        } catch (refreshErr) {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  };

const login = async (username, password) => {
  try {
    await axios.post('/login/', { username, password });
    await checkAuth();
    // After checkAuth, user state is updated
    const userInfo = await fetchUser();
    setUser(userInfo);

    // Redirect based on user_level
    if (userInfo.user_level === 'admin') {
      navigate('/admin-dashboard');
    } else if (userInfo.user_level === 'director') {
      navigate('/director-dashboard'); // or another route for heads/directors
    }else if (userInfo.user_level === 'head') {
      navigate('/head-dashboard'); // or another route for heads/directors
    } else if (userInfo.user_level === 'employee') {
      navigate('/employee-dashboard'); // or another route for employees
    } else if (userInfo.user_level === 'bookkeeper') {
      navigate('/bookkeeper-liquidation'); // or another route for employees
    }else if (userInfo.user_level === 'accountant') {
      navigate('/bookkeeper-liquidation'); // or another route for employees
    }else {
      navigate('/dashboard'); // fallback
    }
  } catch (err) {
    alert('Login failed');
  }
};

  
  const logout = async () => {
    try {
      await axios.post('/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
