import axios from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = Cookies.get("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token")
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) => api.post("/auth/register", { name, email, password }),
  getProfile: () => api.get("/auth/profile"),
}

export const taskApi = {
  getTasks: (params?: any) => api.get("/tasks", { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: any) => api.post("/tasks", data),
  updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  searchTasks: (params: any) => api.get("/tasks/search", { params }),
  getStats: () => api.get("/tasks/stats"),
  bulkUpdate: (data: any) => api.patch("/tasks/bulk", data),
  bulkDelete: (data: any) => api.delete("/tasks/bulk", data),
  duplicateTask: (id: string) => api.post(`/tasks/${id}/duplicate`),
  getDeletedTasks: (params?: any) => api.get("/tasks/deleted", { params }),
  restoreTask: (id: string) => api.patch(`/tasks/${id}/restore`),
}

export default api
