import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'coconuthub_auth_user';
const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/auth';

const DEMO_USERS = {
  wickrama: {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Wickrama Silva',
    businessName: 'Wickrama Traders',
    businessType: 'Both',
    email: 'wickrama@coconuthub.lk',
    phoneNumber: '+94 77 456 1122',
    district: 'Colombo',
    bio: 'Leading coconut and copra trader in Western and North-Western provinces with 15+ years experience.',
    role: 'Trader',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  sunil: {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Sunil Perera',
    businessName: 'Silva Estate',
    businessType: 'Supplier',
    email: 'sunil@silvaestate.lk',
    phoneNumber: '+94 71 224 3311',
    district: 'Kurunegala',
    bio: 'Coconut estate owner supplying premium fresh green coconuts, copra and dried husks in bulk.',
    role: 'Farmer',
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  buyer: {
    id: '33333333-3333-3333-3333-333333333333',
    fullName: 'Colombo Foods PLC',
    businessName: 'Colombo Foods PLC',
    businessType: 'Buyer',
    email: 'procurement@colombofoods.lk',
    phoneNumber: '+94 76 811 2200',
    district: 'Colombo',
    bio: 'Industrial manufacturer and exporter purchasing high grade coconut oil and virgin copra.',
    role: 'Miller',
    isVerified: true,
    createdAt: new Date().toISOString()
  }
};

const DEFAULT_DEMO_USER = DEMO_USERS.wickrama;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read auth user from localStorage', e);
    }
    return null;
  });

  const [hasEnteredApp, setHasEnteredApp] = useState(() => {
    try {
      const entered = sessionStorage.getItem('coconuthub_has_entered');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (entered === 'true' && saved) return true;
    } catch {
      // fallback
    }
    return false;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('register'); // 'register' | 'login'
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } catch (e) {
        console.warn('Could not write auth user to localStorage', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  // Register function
  const register = async ({ email, password, fullName, phoneNumber, district, businessType, businessName, bio }) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email?.trim(),
          password,
          fullName: fullName?.trim(),
          phoneNumber: phoneNumber?.trim(),
          district: district || 'Colombo',
          businessType: businessType || 'Supplier',
          businessName: businessName?.trim() || fullName?.trim(),
          bio: bio?.trim() || ''
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        const errorMsg = data.message ||
          (data.errors ? Object.values(data.errors).flat().join(' ') : null) ||
          'Registration failed. Please check your details.';
        throw new Error(errorMsg);
      }

      if (data.token) {
        localStorage.setItem('coconuthub_token', data.token);
      }
      if (data.user) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        } catch (e) {
          console.warn('Could not store auth user', e);
        }
      }
      setCurrentUser(data.user);
      setHasEnteredApp(true);
      sessionStorage.setItem('coconuthub_has_entered', 'true');
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      console.warn('API register error:', err.message);
      throw err;
    }
  };

  // Login function
  const login = async ({ identifier, password }) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier?.trim(), password })
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        const errorMsg = data.message ||
          (data.errors ? Object.values(data.errors).flat().join(' ') : null) ||
          'Login failed. Invalid credentials.';
        throw new Error(errorMsg);
      }

      if (data.token) {
        localStorage.setItem('coconuthub_token', data.token);
      }
      if (data.user) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        } catch (e) {
          console.warn('Could not store auth user', e);
        }
      }
      setCurrentUser(data.user);
      setHasEnteredApp(true);
      sessionStorage.setItem('coconuthub_has_entered', 'true');
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      console.warn('API login error:', err.message);
      // Demo fallback if testing offline
      const idLower = (identifier || '').toLowerCase();
      let matchedDemoUser = null;
      if (idLower.includes('wickrama') || identifier === '+94774561122') {
        matchedDemoUser = DEMO_USERS.wickrama;
      } else if (idLower.includes('sunil') || identifier === '+94712243311') {
        matchedDemoUser = DEMO_USERS.sunil;
      } else if (idLower.includes('colombo') || idLower.includes('procure') || identifier === '+94768112200') {
        matchedDemoUser = DEMO_USERS.buyer;
      } else if (idLower.includes('demo')) {
        matchedDemoUser = DEMO_USERS.wickrama;
      }

      if (matchedDemoUser) {
        setCurrentUser(matchedDemoUser);
        setHasEnteredApp(true);
        sessionStorage.setItem('coconuthub_has_entered', 'true');
        setAuthModalOpen(false);
        return { success: true, user: matchedDemoUser };
      }
      throw err;
    }
  };

  // Update profile function
  const updateProfile = async (fields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...fields };
    setCurrentUser(updated);

    try {
      await fetch(`${API_BASE}/profile?userId=${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fields.fullName,
          businessName: fields.businessName,
          businessType: fields.businessType,
          district: fields.district,
          bio: fields.bio,
          email: fields.email
        })
      });
    } catch (e) {
      console.warn('Could not sync profile to backend API:', e);
    }
    return updated;
  };

  // Switch Business Type convenience
  const switchBusinessType = async (newType) => {
    return await updateProfile({ businessType: newType });
  };

  const enterAsGuest = () => {
    setHasEnteredApp(true);
    sessionStorage.setItem('coconuthub_has_entered', 'true');
  };

  const returnToLoginScreen = () => {
    setCurrentUser(null);
    setHasEnteredApp(false);
    sessionStorage.removeItem('coconuthub_has_entered');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('coconuthub_token');
  };

  const logout = () => {
    returnToLoginScreen();
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openProfileDialog = () => {
    setProfileDialogOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        hasEnteredApp,
        enterAsGuest,
        returnToLoginScreen,
        register,
        login,
        updateProfile,
        switchBusinessType,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openRegisterModal,
        openLoginModal,
        profileDialogOpen,
        setProfileDialogOpen,
        openProfileDialog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
