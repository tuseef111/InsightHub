// import axios from "axios"
// import { useAuthStore } from "@/store/authStore"

// const RAW_BASE = import.meta.env.VITE_API_BASE_URL
// const BASE = (RAW_BASE && typeof RAW_BASE === "string" && RAW_BASE.startsWith("http"))
//   ? RAW_BASE
//   : "http://localhost:5001/api"

// const api = axios.create({
//   baseURL: BASE,
//   withCredentials: true,
// })

// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// api.interceptors.response.use(
//   (resp) => resp,
//   async (error) => {
//     const original = error.config
//     if (error.response && error.response.status === 401 && !original._retry) {
//       original._retry = true
//       try {
//         const refresh = await axios.post(BASE + "/auth/refresh", null, { withCredentials: true })
//         const token = refresh.data.token
//         const setToken = useAuthStore.getState().setToken
//         if (setToken) setToken(token)
//         original.headers.Authorization = `Bearer ${token}`
//         return api(original)
//       } catch {
//         useAuthStore.getState().logout()
//       }
//     }
//     throw error
//   }
// )

// export default api


import axios from "axios"
import { useAuthStore } from "@/store/authStore"

// Simple base URL - remove complex logic
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api"

console.log("🔧 API Base URL:", BASE_URL) // For debugging

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // Temporary: set to false
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('ih_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Remove refresh interceptor for now (simplify)
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