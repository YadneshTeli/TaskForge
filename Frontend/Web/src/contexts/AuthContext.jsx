import React, { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext.js'
import api from '@/lib/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return null
    }
    try {
      const response = await api.get('/auth/me')
      const loadedUser = response.data.user || response.data
      setUser(loadedUser)
      return loadedUser
    } catch {
      localStorage.removeItem('token')
      setUser(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: loggedInUser } = response.data
      
      localStorage.setItem('token', token)
      if (loggedInUser) {
        setUser(loggedInUser)
        return { success: true, user: loggedInUser }
      }
      const fetchedUser = await refreshUser()
      return { success: true, user: fetchedUser }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user: registeredUser } = response.data
      
      localStorage.setItem('token', token)
      if (registeredUser) {
        setUser(registeredUser)
        return { success: true, user: registeredUser }
      }
      const fetchedUser = await refreshUser()
      return { success: true, user: fetchedUser }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    setUser,
    refreshUser,
    isLoading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
