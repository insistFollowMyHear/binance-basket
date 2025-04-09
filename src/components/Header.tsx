import { useEffect, useState, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"

import { RootState } from "../store/store"
import { logout } from "../store/features/authSlice"
import { setCurrentUser } from "../store/features/authSlice"
import { setCurrentUserRestrictions } from "../store/features/authSlice"

import { ThemeToggle } from "./theme-toggle"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger
} from "./ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "./ui/alert-dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"

import { LogOut, User, Plus, ChevronDown, Trash2 } from "lucide-react"

import WebSocketService from "../services/ws"
import { binanceUsers, userPreferences, auth, wallet, BinanceUser } from "../services"

import { useToast } from "@/hooks/use-toast";
import { useLoading } from "../hooks/useLoading"
import { spotTrading } from "../services"

export function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loadedRef = useRef(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  const { toast } = useToast()
  const { withLoading, showLoading, hideLoading } = useLoading()
  
  const [binanceAccounts, setBinanceAccounts] = useState<BinanceUser[]>([])
  const [currentBinanceUser, setCurrentBinanceUser] = useState<BinanceUser | null>(null)
  const [currentBinanceUserRestrictions, setCurrentBinanceUserRestrictions] = useState<any | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 表单状态
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [ws, setWs] = useState<WebSocketService | null>(null)

  useEffect(() => {
    if (isAuthenticated && user && !loadedRef.current) {
      showLoading('加载中...')
      loadBinanceAccounts()
      setWs(new WebSocketService())
      loadedRef.current = true
    }
  }, [isAuthenticated, user])

  const loadBinanceAccounts = async () => {
    try {
      // 加载用户的Binance账户
      const accounts = await binanceUsers.getByUserId(user.id)
      setBinanceAccounts(accounts)
      // 加载用户偏好
      const preference = await userPreferences.getByUserId(user.id)
      if (preference?.current_binance_user_id && accounts.length > 0) {
        const current = accounts.find(acc => acc.id === preference.current_binance_user_id)
        if (current) {
          setCurrentBinanceUser(current)
          dispatch(setCurrentUser(current))
        } else {
          setCurrentBinanceUser(accounts[0])
          dispatch(setCurrentUser(accounts[0]))
        }
      } else if (accounts.length > 0) {
        setCurrentBinanceUser(accounts[0])
        dispatch(setCurrentUser(accounts[0]))
        if (user.id) {
          await userPreferences.updateCurrentBinanceUserId(user.id, accounts[0].id)
        }
      }
      loadApiRestrictions(preference?.current_binance_user_id || accounts[0].id)
    } catch (error) {
      console.error("加载Binance账户失败:", error)
      hideLoading()
    }
  }

  // 加载API限制
  const loadApiRestrictions = async (binanceUserId: string) => {
    try {
      const restrictions = await wallet.getApiRestrictions(binanceUserId)
      setCurrentBinanceUserRestrictions(restrictions.data)
      dispatch(setCurrentUserRestrictions(restrictions.data))
    } catch (error) {
      console.error('获取API限制失败:', error)
    } finally {
      hideLoading()
    }
  }

  const handleLogout = async () => {
    try {
      // 先调用Supabase的退出登录方法（包含完整的清理）
      await auth.logout()
      
      // 然后更新Redux状态
      dispatch(logout())

      // 关闭所有WebSocket连接
      ws?.close()

      // 短暂延迟确保所有清理操作都已完成
      setTimeout(() => {
        // 重定向到登录页面
        navigate('/login')
      }, 100)
    } catch (error) {
      console.error("退出登录失败:", error)
    }
  }

  const handleSwitchBinanceUser = async (id: string) => {
    try {
      const selected = binanceAccounts.find(acc => acc.id === id)
      if (selected) {
        setCurrentBinanceUser(selected)
        if (user.id) {
          await userPreferences.updateCurrentBinanceUserId(user.id, id)
        }
        window.location.reload()
      }
    } catch (error) {
      console.error("切换Binance账户失败:", error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
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
    setName('')
    setApiKey('')
    setSecretKey('')
    setAvatar(null)
    setAvatarPreview(null)
  }

  // 通过账户信息检查用户是否存在
  const checkUserExists = async () => {
    let isRealUser: Boolean = false
    try {
      await spotTrading.getUserAccount('', apiKey, secretKey)
      isRealUser = true
    } catch(err) {
      console.error('检查用户是否存在失败:', err)
      isRealUser = false
    }
    return isRealUser
  }

  // 添加账户
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()

    const isRealUser = await checkUserExists()
    if (!isRealUser) {
      toast({
        title: '用户不存在',
        description: '请检查API Key和Secret Key是否正确',
        variant: 'destructive'
      })
      return
    }

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
          nickname: name,
          api_key: apiKey,
          secret_key: secretKey,
          avatar_url: avatarUrl || undefined
        })

        // 更新状态
        setBinanceAccounts([...binanceAccounts, newUser])
        
        // 如果这是第一个账户，设为当前账户
        if (binanceAccounts.length === 0) {
          setCurrentBinanceUser(newUser)
          await userPreferences.updateCurrentBinanceUserId(user.id, newUser.id)
          // 刷新页面
          window.location.reload()
        }
        
        // 重置表单和关闭对话框
        resetForm()
        setAddDialogOpen(false)
      } catch (error) {
        console.error('添加用户失败:', error)
        toast({
          title: '添加用户失败',
          description: '请重试',
          variant: 'destructive'
        })
      }
    }, '添加账户中...')
  }

  // 删除账户
  const handleDeleteUser = async (id: string) => {
    try {
      setIsDeleting(true)
      showLoading('删除账户中...')
      await binanceUsers.delete(id)
      
      // 刷新账户列表
      const updatedAccounts = binanceAccounts.filter(account => account.id !== id)
      setBinanceAccounts(updatedAccounts)

      // 如果删除的是当前账户，需要更新当前账户
      if (id === currentBinanceUser?.id && updatedAccounts.length > 0) {
        await handleSwitchBinanceUser(updatedAccounts[0].id)
      } else if (updatedAccounts.length === 0) {
        setCurrentBinanceUser(null)
        window.location.reload()
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      toast({
        title: '删除用户失败',
        description: '请重试',
        variant: 'destructive'
      })
    } finally {
      hideLoading()
      setIsDeleting(false)
    }
  }

  return (
    <header className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              {/* <img src="/logo.svg" alt="BisonSwap" className="h-8 w-8" /> */}
              <span className="text-xl font-bold text-foreground">VSG</span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                {
                  currentBinanceUserRestrictions?.enableSpotAndMarginTrading && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-foreground">
                        交易
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4 bg-background">
                          <li>
                            <Link
                              to="/spot"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                            >
                              <div className="text-sm font-medium leading-none">现货交易</div>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                }

                {/* {
                  currentBinanceUserRestrictions?.enableFutures && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-foreground">
                        合约
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4 bg-background">
                          <li>
                            <Link
                              to="/futures/usdt"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                            >
                              <div className="text-sm font-medium leading-none">U本位合约</div>
                            </Link>
                          </li>
                          <li>
                            <Link
                              to="/futures/coin"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                            >
                              <div className="text-sm font-medium leading-none">币本位合约</div>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                } */}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Binance 账户切换 */}
                {binanceAccounts.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1">
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-2">
                            {currentBinanceUser?.avatar_url ? (
                              <AvatarImage src={currentBinanceUser.avatar_url} />
                            ) : (
                              <AvatarFallback>
                                {currentBinanceUser?.nickname ? getInitials(currentBinanceUser.nickname) : "B"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="max-w-[100px] truncate">
                            {currentBinanceUser?.nickname || "Binance"}
                          </span>
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>切换账户</DropdownMenuLabel>
                      {binanceAccounts.map((account) => (
                        <DropdownMenuItem
                          key={account.id}
                          className="flex items-center justify-between"
                          onSelect={(e) => {
                            // 如果点击的是删除按钮，阻止 DropdownMenu 关闭
                            if ((e.target as HTMLElement).closest('.delete-btn')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <div
                            className="flex items-center flex-1 cursor-pointer"
                            onClick={() => handleSwitchBinanceUser(account.id)}
                          >
                            <Avatar className="h-5 w-5 mr-2">
                              {account.avatar_url ? (
                                <AvatarImage src={account.avatar_url} />
                              ) : (
                                <AvatarFallback>{getInitials(account.nickname)}</AvatarFallback>
                              )}
                            </Avatar>
                            <span>{account.nickname}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive delete-btn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-3 w-3" />
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteUser(account.id);
                                    }}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "删除中..." : "确认删除"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>添加账户</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" size="sm" className="h-9 gap-1"  onClick={() => setAddDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>添加账户</span>
                  </Button>
                )}

                {/* 用户菜单 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url} alt={user?.name} />
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || user?.email}</p>
                        {user?.name && (
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>个人信息</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  登录
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open)
        if (!open) {
          resetForm()
        }
      }}>
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
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <Input
                  className="cursor-pointer"
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
    </header>
  )
}