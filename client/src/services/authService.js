import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// LOGIN
export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return res.data;
};

// REGISTER
export const registerUser = async (name, email, phone, address, password) => {
  const res = await axios.post(`${API_URL}/register`, {
    name,
    email,
    phone,
    address,
    password,
  });
  return res.data;
};

export const getProfile = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const updateProfile = async (profileData) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API_URL}/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};
