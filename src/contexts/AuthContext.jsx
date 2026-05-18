import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isMock = !apiKey || apiKey === '' || apiKey === 'your_firebase_api_key_here';

  function signup(email, password) {
    if (isMock) {
      setCurrentUser({ uid: 'mock-user-id', email });
      return Promise.resolve();
    }
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    if (isMock) {
      setCurrentUser({ uid: 'mock-user-id', email });
      return Promise.resolve();
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    if (isMock) {
      setCurrentUser(null);
      return Promise.resolve();
    }
    return signOut(auth);
  }

  useEffect(() => {
    // If we don't have valid firebase config, just mock it
    if (isMock) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [isMock]);

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
