import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { auth, isAllowedEmail } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function with domain validation
  async function signup(email, password) {
    if (!isAllowedEmail(email)) {
      throw new Error('Email domain not allowed. Please use an authorized educational institution email.');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  }

  // Sign in function with domain validation
  async function login(email, password) {
    if (!isAllowedEmail(email)) {
      throw new Error('Email domain not allowed. Please use an authorized educational institution email.');
    }
    
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Sign out function
  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

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


