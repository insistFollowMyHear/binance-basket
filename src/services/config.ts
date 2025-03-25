import { createClient } from '@supabase/supabase-js'

// 用户类型
export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

// Binance用户类型
export interface BinanceUser {
  id: string
  user_id: string
  api_key: string
  secret_key: string
  nickname: string
  avatar_url?: string
  created_at: string
}

// 用户偏好类型
export interface UserPreference {
  id: string
  user_id: string
  current_binance_user_id?: string
  theme?: string
  language?: string
  created_at?: string
  updated_at?: string
}

export const baseUrl = import.meta.env.VITE_BINANCE_API_URL

// 初始化Supabase客户端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建Supabase客户端并配置持久化会话
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 在应用启动时添加会话状态变化监听器
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase Auth 状态变化:', event, session ? '已登录' : '未登录')
})