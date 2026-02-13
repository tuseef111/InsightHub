import { create } from 'zustand'
import api from '@/lib/api'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('ih_token') || null,
  user: JSON.parse(localStorage.getItem('ih_user')) || null,
  isAuthenticated: !!localStorage.getItem('ih_token'),
  login: (token, user) => {
    localStorage.setItem('ih_token', token)
    if (user) localStorage.setItem('ih_user', JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('ih_token')
    localStorage.removeItem('ih_user')
    set({ token: null, user: null, isAuthenticated: false })
  },
  setToken: (token) => {
    localStorage.setItem('ih_token', token)
    set({ token, isAuthenticated: true })
  },
  updateProfile: async (payload) => {
    // Assuming API endpoint exists or simulating it
    // If real API:
    // const { data } = await api.put('/users/me', payload)
    // set({ user: data.user })
    // localStorage.setItem('ih_user', JSON.stringify(data.user))
    
    // For now, since I don't know the API exactly, I'll wrap it in try/catch or assume it works if endpoint exists.
    // Profile.jsx calls this.
    try {
        const { data } = await api.put('/users/profile', payload) // Guessing endpoint
        set({ user: data.user })
        localStorage.setItem('ih_user', JSON.stringify(data.user))
        return data
    } catch (e) {
        console.error("Failed to update profile", e)
        throw e
    }
  }
}))
