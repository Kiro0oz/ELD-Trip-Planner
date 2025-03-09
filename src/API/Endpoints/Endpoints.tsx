import axios from "axios";
import { DOMAIN } from "../Config";
import { useAuth } from "../../context/AuthContext";


const API_AUTH_BASE_URL = `${DOMAIN}/api/auth`;


export const registerUser = async (userData: {
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  license_number: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_AUTH_BASE_URL}/register/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || "An error occurred during registration.";
  }
};

export const loginUser = async (userDate: {
    username: string;
    password: string;
}) => {
    try {
        const response = await axios.post(`${API_AUTH_BASE_URL}/login/`, userDate, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || "An error occurred during login.";
    }
}


export const logoutUser = async (refreshToken: string) => {
    const { token } = useAuth();
    try {
      await axios.post(`${API_AUTH_BASE_URL}/logout/`, { refresh_token: refreshToken }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      localStorage.removeItem("token"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };