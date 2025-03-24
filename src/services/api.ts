import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 创建Supabase客户端并配置持久化会话
const supabase = createClient(supabaseUrl, supabaseKey, {
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

// 认证相关
export const auth = {
  // 注册
  register: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // 登录
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // 退出登录
  logout: async () => {
    // 调用Supabase的退出登录接口
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // 确保清除所有Supabase相关的token
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
    
    // 清理其他相关数据
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    
    // 设置cookies过期
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    return true
  },

  // 获取当前用户
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
}

// Binance用户相关
export const binanceUsers = {
  // 获取用户的所有Binance账户
  getByUserId: async (userId: string): Promise<BinanceUser[]> => {
    const { data, error } = await supabase
      .from('binance_users')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  },

  // 创建Binance账户
  create: async (binanceUser: Omit<BinanceUser, 'id' | 'created_at'>): Promise<BinanceUser> => {
    const { data, error } = await supabase
      .from('binance_users')
      .insert([binanceUser])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新Binance账户
  update: async (id: string, updates: Partial<BinanceUser>): Promise<BinanceUser> => {
    const { data, error } = await supabase
      .from('binance_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 删除Binance账户
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('binance_users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // 上传头像
  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('binance')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    const { data } = supabase.storage.from('binance').getPublicUrl(filePath)
    return data.publicUrl
  }
}

// 用户偏好相关
export const userPreferences = {
  // 获取用户偏好
  getByUserId: async (userId: string): Promise<UserPreference | null> => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116是"没有找到行"的错误
    return data
  },

  // 创建或更新用户偏好
  upsert: async (preference: Omit<UserPreference, 'id'>): Promise<UserPreference> => {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([preference])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 更新当前Binance用户ID
  updateCurrentBinanceUserId: async (userId: string, binanceUserId: string): Promise<UserPreference> => {
    // 首先查看是否已有记录
    const pref = await userPreferences.getByUserId(userId)
    
    if (pref) {
      return userPreferences.upsert({
        ...pref,
        current_binance_user_id: binanceUserId
      })
    } else {
      return userPreferences.upsert({
        user_id: userId,
        current_binance_user_id: binanceUserId
      })
    }
  }
} 