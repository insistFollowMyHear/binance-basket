import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { BinanceUser, binanceUsers, userPreferences } from '../services/api'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { PlusCircle, Trash2, Edit, Check } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useLoading } from '../hooks/useLoading'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog'
import { Loading } from './ui/loading'
export function UserProfile() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { withLoading, showLoading, hideLoading } = useLoading()

  const [binanceAccounts, setBinanceAccounts] = useState<BinanceUser[]>([])
  const [currentBinanceUserId, setCurrentBinanceUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<BinanceUser | null>(null)

  // 表单状态
  const [nickname, setNickname] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    }
  }, [isAuthenticated, user])

  // 刷新页面
  const refreshPage = () => {
    window.location.reload()
  }

  const loadUserData = async () => {
    withLoading(async () => {
      try {
        setLoading(true)
        // 加载用户的Binance账户
        const accounts = await binanceUsers.getByUserId(user.id)
        setBinanceAccounts(accounts)

        // 加载用户偏好设置
        const preference = await userPreferences.getByUserId(user.id)
        if (preference && preference.current_binance_user_id) {
          setCurrentBinanceUserId(preference.current_binance_user_id)
        } else if (accounts.length > 0) {
          // 如果没有设置当前账户，但有账户，则设置第一个为当前账户
          setCurrentBinanceUserId(accounts[0].id)
          await userPreferences.updateCurrentBinanceUserId(user.id, accounts[0].id)
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
      } finally {
        setLoading(false)
      }
    }, '加载用户数据...')
  }

  const handleSwitchUser = async (id: string) => {
    try {
      showLoading('切换账户中...')
      setCurrentBinanceUserId(id)
      await userPreferences.updateCurrentBinanceUserId(user.id, id)
      refreshPage()
    } catch (error) {
      console.error('切换用户失败:', error)
    } finally {
      hideLoading()
    }
  }

  const handleDeleteUser = async (id: string) => {
    try {
      setIsDeleting(true)
      showLoading('删除账户中...')
      await binanceUsers.delete(id)
      
      // 刷新账户列表
      const updatedAccounts = binanceAccounts.filter(account => account.id !== id)
      setBinanceAccounts(updatedAccounts)

      // 如果删除的是当前账户，需要更新当前账户
      if (id === currentBinanceUserId && updatedAccounts.length > 0) {
        await handleSwitchUser(updatedAccounts[0].id)
      } else if (updatedAccounts.length === 0) {
        setCurrentBinanceUserId(null)
        refreshPage()
      }
    } catch (error) {
      console.error('删除用户失败:', error)
    } finally {
      hideLoading()
      setIsDeleting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(file)
      
      // 创建预览
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setNickname('')
    setApiKey('')
    setSecretKey('')
    setAvatar(null)
    setAvatarPreview(null)
    setEditingUser(null)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    withLoading(async () => {
      try {
        let avatarUrl = ''
        
        // 如果有头像，先上传
        if (avatar) {
          avatarUrl = await binanceUsers.uploadAvatar(user.id, avatar)
        }
        
        // 创建新用户
        const newUser = await binanceUsers.create({
          user_id: user.id,
          nickname,
          api_key: apiKey,
          secret_key: secretKey,
          avatar_url: avatarUrl || undefined
        })

        // 更新状态
        setBinanceAccounts([...binanceAccounts, newUser])
        
        // 如果这是第一个账户，设为当前账户
        if (binanceAccounts.length === 0) {
          setCurrentBinanceUserId(newUser.id)
          await userPreferences.updateCurrentBinanceUserId(user.id, newUser.id)
        }
        
        // 重置表单和关闭对话框
        resetForm()
        setAddDialogOpen(false)
      } catch (error) {
        console.error('添加用户失败:', error)
        alert('添加用户失败，请重试')
      }
    }, '添加账户中...')
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return
    
    withLoading(async () => {
      try {
        let avatarUrl = editingUser.avatar_url || ''
        
        // 如果有新头像，上传
        if (avatar) {
          avatarUrl = await binanceUsers.uploadAvatar(user.id, avatar)
        }
        
        // 更新用户
        const updatedUser = await binanceUsers.update(editingUser.id, {
          nickname,
          api_key: apiKey,
          secret_key: secretKey,
          avatar_url: avatarUrl || undefined
        })
        
        // 更新状态
        setBinanceAccounts(
          binanceAccounts.map(acc => (acc.id === updatedUser.id ? updatedUser : acc))
        )
        
        // 重置表单和关闭对话框
        resetForm()
        setEditDialogOpen(false)
      } catch (error) {
        console.error('更新用户失败:', error)
        alert('更新用户失败，请重试')
      }
    }, '更新账户中...')
  }

  const openEditDialog = (user: BinanceUser) => {
    setEditingUser(user)
    setNickname(user.nickname)
    setApiKey(user.api_key)
    setSecretKey(user.secret_key)
    setAvatarPreview(user.avatar_url || null)
    setEditDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" text="加载用户数据..." />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">用户资料</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Binance 账户</h3>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" /> 添加账户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加 Binance 账户</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar">头像</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} />
                      ) : (
                        <AvatarFallback>+</AvatarFallback>
                      )}
                    </Avatar>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">昵称</Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Input
                    id="secretKey"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setAddDialogOpen(false)
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">添加</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* 编辑对话框 */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑 Binance 账户</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditUser} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-avatar">头像</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {avatarPreview ? (
                        <AvatarImage src={avatarPreview} />
                      ) : (
                        <AvatarFallback>
                          {editingUser ? getInitials(editingUser.nickname) : '+'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Input
                      id="edit-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-nickname">昵称</Label>
                  <Input
                    id="edit-nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-apiKey">API Key</Label>
                  <Input
                    id="edit-apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-secretKey">Secret Key</Label>
                  <Input
                    id="edit-secretKey"
                    type="password"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm()
                      setEditDialogOpen(false)
                    }}
                  >
                    取消
                  </Button>
                  <Button type="submit">保存</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {binanceAccounts.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-lg">
            <p className="text-muted-foreground">您还没有添加任何 Binance 账户</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setAddDialogOpen(true)}
            >
              添加账户
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {binanceAccounts.map(account => (
              <div
                key={account.id}
                className={`p-4 rounded-lg border ${
                  account.id === currentBinanceUserId
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      {account.avatar_url ? (
                        <AvatarImage src={account.avatar_url} />
                      ) : (
                        <AvatarFallback>{getInitials(account.nickname)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-foreground">{account.nickname}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        API: {account.api_key.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确定要删除此账户吗？</AlertDialogTitle>
                          <AlertDialogDescription>
                            此操作无法撤销。这将永久删除此Binance账户及其所有相关数据。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(account.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "删除中..." : "确认删除"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {account.id !== currentBinanceUserId && (
                  <div className="mt-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitchUser(account.id)}
                    >
                      切换到此账户
                    </Button>
                  </div>
                )}
                {account.id === currentBinanceUserId && (
                  <div className="mt-4 flex items-center justify-end text-sm text-primary">
                    <Check className="h-4 w-4 mr-1" /> 当前使用中
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 