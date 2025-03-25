import { supabase } from './config'
import { BinanceUser } from './config'

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