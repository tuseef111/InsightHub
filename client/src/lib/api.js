import axios from "axios"
import { useAuthStore } from "@/store/authStore"

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"

console.log(" API Base URL:", BASE_URL) 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, 
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('ih_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default api
