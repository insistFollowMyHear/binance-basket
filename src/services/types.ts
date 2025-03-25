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
  nickname: string
  api_key: string
  secret_key: string
  created_at: string
  avatar_url?: string
}

// 用户偏好类型
export interface UserPreference {
  id: string
  user_id: string
  current_binance_user_id?: string
}