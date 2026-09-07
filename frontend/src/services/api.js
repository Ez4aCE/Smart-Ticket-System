import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const createTicket = async (data) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("description", data.description);

  if (data.attachment) {
    formData.append("attachment", data.attachment);
  }

  const response = await api.post("/tickets", formData);

  return response.data;
};

export const getMyTickets = async () => {
  const response = await api.get("/tickets/my");
  return response.data;
};

export const getTicket = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const updateTicket = async (id, data) => {
  const response = await api.put(`/tickets/${id}`, data);
  return response.data;
};

export default api;