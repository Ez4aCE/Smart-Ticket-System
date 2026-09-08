import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
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

export const analyzeTicket = async (title, description) => {
  const response = await api.post("/ai/analyze", { title, description });
  return response.data;
};

export const createTicket = async (title, description) => {
  const response = await api.post("/tickets", { title, description });
  return response.data;
};

export const getTickets = async () => {
  const response = await api.get("/tickets");
  return response.data;
};

export const getTicket = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

export const updateTicket = async (id, data) => {
  const response = await api.patch(`/tickets/${id}/status`, data);
  return response.data;
};

export const updateTicketDetails = async (id, data) => {
  const response = await api.patch(`/tickets/${id}`, data);
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

export const getStaff = async () => {
  const response = await api.get("/staff");
  return response.data;
};

export const triageTicket = async (ticketId, data) => {
  const response = await api.post(`/tickets/${ticketId}/triage`, data);
  return response.data;
};

export const addComment = async (ticketId, comment) => {
  const response = await api.post(`/tickets/${ticketId}/comments`, { comment });
  return response.data;
};

export const reopenTicket = async (ticketId, reason = 'Issue not resolved') => {
  const response = await api.post(`/tickets/${ticketId}/reopen`, { reason });
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/departments', data);
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post('/staff', data);
  return response.data;
};

export default api;
