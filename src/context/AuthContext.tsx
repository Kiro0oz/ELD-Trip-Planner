import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  license: string;
  phone: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  license: string;
  phone: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    // Simulate API call
    if (email && password) {
      setUser({
        id: '1',
        username: email.split('@')[0],
        firstName: 'John',
        lastName: 'Doe',
        license: 'CDL123456',
        phone: '+1 (555) 123-4567',
        email
      });
      navigate('/');
    }
  };

  const register = async (userData: RegisterData) => {
    // Simulate API call
    setUser({
      id: '1',
      ...userData
    });
    navigate('/');
  };

  const logout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}