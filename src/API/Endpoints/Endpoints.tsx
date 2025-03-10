import axios from "axios";
import { DOMAIN } from "../Config";



const API_AUTH_BASE_URL = `${DOMAIN}/api/auth`;
const API_TRIP_BASE_URL = `${DOMAIN}/api/trip`;


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


export const logoutUser = async (refreshToken: string, token: string) => {
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

export const driverInfo = async (token: string) => {
  try {
    const response = await axios.get(`${API_AUTH_BASE_URL}/driverInfo/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; 
  } catch (error) {
    console.error("Error fetching driver info:", error);
    throw error; 
  }
};


export const createTrip = async (tripData: {
  start_location: string;
  end_location: string;
  start_date: string;
  end_date: string;
  totalDistance: number;
  totalDuration: number;
  requiredBreaks: number;
  requiredRests: number;
}, token: string) => {
  try {
    const response = await axios.post(`${API_TRIP_BASE_URL}/create/`, tripData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating trip:", error);
    throw error.response?.data || "An error occurred while creating the trip.";
  }
};


export const driverTripHistory = async (token: string, driverId: number) => {
  try {
    const response = await axios.get(`${API_TRIP_BASE_URL}/my/${driverId}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data; 
  } catch (error) {
    console.error("Error fetching driver info:", error);
    throw error; 
  }
};
