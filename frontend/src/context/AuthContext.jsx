import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Set Authorization header for any fetch requests
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Verify and load user details on boot if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // Restore offline demo session without hitting the API
      if (token.startsWith('demo-token-')) {
        const cached = localStorage.getItem('demoUser');
        if (cached) {
          try {
            setUser(JSON.parse(cached));
          } catch {
            logout();
          }
        } else {
          logout();
        }
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          // Fetch notifications once logged in
          fetchNotifications(token);
        } else {
          // Token is invalid/expired
          logout();
        }
      } catch (err) {
        console.error('Error fetching user context:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  // Periodically fetch notifications if logged in (every 25 seconds)
  useEffect(() => {
    if (!token || !user || token.startsWith('demo-token-')) return;

    const interval = setInterval(() => {
      fetchNotifications(token);
    }, 25000);

    return () => clearInterval(interval);
  }, [token, user]);

  const fetchNotifications = async (authToken = token) => {
    if (!authToken) return;
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        await fetchNotifications(data.token);
        return { success: true, role: data.user.role };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error connecting to backend.' };
    }
  };

  const register = async (formData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error during registration.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('demoUser');
    setToken('');
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const demoAccounts = {
    doctor: {
      _id: 'demo-doctor',
      name: 'Dr. Ananya Sharma',
      email: 'doctor@epiwatch.org',
      role: 'doctor',
      phone: '+91 98765 43210',
      department: 'General Medicine',
      city: 'Mumbai',
      state: 'Maharashtra',
      facility: {
        _id: 'demo-facility',
        name: 'Sunrise Multispeciality Clinic',
        city: 'Mumbai',
        state: 'Maharashtra'
      }
    },
    lab: {
      _id: 'demo-lab',
      name: 'Kavita Rao',
      email: 'lab@epiwatch.org',
      role: 'lab',
      phone: '+91 98765 43220',
      department: 'Microbiology Lab',
      city: 'Hubli',
      state: 'Karnataka',
      facility: {
        _id: 'demo-facility-lab',
        name: 'Karnataka Apex Lab',
        city: 'Dharwad',
        state: 'Karnataka'
      }
    },
    authority: {
      _id: 'demo-authority',
      name: 'Priya Nair',
      email: 'authority@epiwatch.gov.in',
      role: 'authority',
      phone: '+91 98765 40001',
      department: 'Epidemiology',
      city: 'New Delhi',
      state: 'Delhi'
    },
    admin: {
      _id: 'demo-admin',
      name: 'Platform Admin',
      email: 'admin@epiwatch.gov.in',
      role: 'admin',
      phone: '+91 98765 40002',
      department: 'Operations',
      city: 'New Delhi',
      state: 'Delhi'
    }
  };

  // Instant hackathon demo login (works even if MongoDB is offline)
  const demoLogin = (role) => {
    const demoUser = demoAccounts[role];
    if (!demoUser) return { success: false, error: 'Unknown demo role.' };

    const demoToken = `demo-token-${role}`;
    localStorage.setItem('token', demoToken);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setToken(demoToken);
    setUser(demoUser);
    setNotifications([
      {
        _id: 'demo-n1',
        title: 'Welcome to Swasthya Sentinel',
        message: `Signed in as ${demoUser.name} (demo mode).`,
        type: 'system',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]);
    setUnreadCount(1);
    return { success: true, role: demoUser.role };
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error updating profile.' };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: 'Network error changing password.' };
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        unreadCount,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        changePassword,
        getAuthHeaders,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
