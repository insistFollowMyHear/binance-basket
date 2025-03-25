import { supabase, UserPreference, baseUrl } from './config'

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
  },

  // 获取当前用户现货账户信息
  getBinanceUserAccount: async (binanceUserId: string): Promise<UserPreference | null> => {
    const response = await fetch(`${baseUrl}/api/user/account?id=${binanceUserId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user account data')
    }
    return response.json()
  },

  // 获取当前用户U本位合约账户余额
  getBinanceUserFuturesAccount: async (binanceUserId: string): Promise<UserPreference | null> => {
    const response = await fetch(`${baseUrl}/api/user/futures/balance?id=${binanceUserId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user futures account data')
    }
    return response.json()
  },

  // 获取当前用户币本位合约账户余额
  getBinanceUserFuturesCoinAccount: async (binanceUserId: string): Promise<UserPreference | null> => {
    const response = await fetch(`${baseUrl}/api/user/futures/coin/balance?id=${binanceUserId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user futures coin account data')
    }
    return response.json()
  }
} 