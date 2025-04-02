import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: any | null
  isAuthenticated: boolean
  loading: boolean
  currentUser: any | null
  currentUserRestrictions: any | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  currentUser: null,
  currentUserRestrictions: null
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.loading = false
    },
    setCurrentUser: (state, action: PayloadAction<any>) => {
      state.currentUser = action.payload
    },
    setCurrentUserRestrictions: (state, action: PayloadAction<any>) => {
      state.currentUserRestrictions = action.payload
    },
    logout: (state) => {
      // 清除Supabase特定的认证token
      localStorage.removeItem('sb-vlravymgetvazapkevbp-auth-token')
      sessionStorage.removeItem('sb-vlravymgetvazapkevbp-auth-token')
      
      // 清除任何通用的Supabase token格式
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key)
        }
      })
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          sessionStorage.removeItem(key)
        }
      })
      
      // 清理其他可能存储的用户相关数据
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
      
      // 重置状态
      state.user = null
      state.isAuthenticated = false
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setUser, logout, setLoading, setCurrentUser, setCurrentUserRestrictions } = authSlice.actions
export default authSlice.reducer