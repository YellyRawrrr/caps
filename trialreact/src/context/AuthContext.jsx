import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [firstTimeLoginData, setFirstTimeLoginData] = useState(null);
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
    // Don't check auth if we're in first-time login flow
    if (showPasswordChange) {
      setLoading(false);
      return;
    }
    
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

const login = async (email, password) => {
  try {
    const response = await axios.post('/login/', { email, password });
    
    // Check if password change is required
    if (response.data.must_change_password) {
      // First, set the user data and redirect to dashboard
      const userInfo = await fetchUser();
      setUser(userInfo);
      
      // Then set up the first-time login modal
      setFirstTimeLoginData({
        userId: response.data.user_id,
        userEmail: email
      });
      setShowPasswordChange(true);
      
      // Redirect to appropriate dashboard based on user level
      if (userInfo.user_level === 'admin') {
        navigate('/admin-dashboard');
      } else if (userInfo.user_level === 'director') {
        navigate('/director-dashboard');
      } else if (userInfo.user_level === 'head') {
        navigate('/head-dashboard');
      } else if (userInfo.user_level === 'employee') {
        navigate('/employee-dashboard');
      } else if (userInfo.user_level === 'bookkeeper') {
        navigate('/bookkeeper-liquidation');
      } else if (userInfo.user_level === 'accountant') {
        navigate('/bookkeeper-liquidation');
      } else {
        navigate('/dashboard');
      }
      
      setLoading(false);
      return; // Don't proceed with normal login flow
    }
    
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
    toast.error('Login failed');
  }
};

  
  const logout = async () => {
    try {
      await axios.post('/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
    setShowPasswordChange(false);
    setFirstTimeLoginData(null);
    navigate('/login');
  };

  const handleFirstTimeLoginComplete = async () => {
    setShowPasswordChange(false);
    setFirstTimeLoginData(null);
    // Re-authenticate user after email verification
    await checkAuth();
    const userInfo = await fetchUser();
    setUser(userInfo);
    
    // Redirect based on user_level
    if (userInfo.user_level === 'admin') {
      navigate('/admin-dashboard');
    } else if (userInfo.user_level === 'director') {
      navigate('/director-dashboard');
    } else if (userInfo.user_level === 'head') {
      navigate('/head-dashboard');
    } else if (userInfo.user_level === 'employee') {
      navigate('/employee-dashboard');
    } else if (userInfo.user_level === 'bookkeeper') {
      navigate('/bookkeeper-liquidation');
    } else if (userInfo.user_level === 'accountant') {
      navigate('/bookkeeper-liquidation');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading, 
      showPasswordChange, 
      setShowPasswordChange,
      firstTimeLoginData,
      handleFirstTimeLoginComplete 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
