import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, logoutUser } from '../API/Endpoints/Endpoints';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

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
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser({ username, password });

      if (data.access) {
        setToken(data.access); 
        localStorage.setItem("token", data.access); // For Demo purposes
        showSuccessToast("Login successful!");
        navigate('/');
      } else {
        showErrorToast("Invalid credentials. Please try again.");
      }
    } catch (error) {
      showErrorToast("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await registerUser(userData);
      showSuccessToast("Registration successful!");
    } catch (error) {
      showErrorToast("Registration failed");
      console.error("Registration failed " , error);
    }
  };

  const logout = async (token: string) => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutUser(refreshToken, token);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setToken(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
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
