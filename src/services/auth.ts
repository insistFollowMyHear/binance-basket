import { supabase } from './config'

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