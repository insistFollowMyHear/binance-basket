import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu"
import { Link, useNavigate } from "react-router-dom"
import { ThemeToggle } from "./theme-toggle"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../store/store"
import { logout } from "../store/features/authSlice"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { LogOut, User, Plus, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { binanceUsers, userPreferences, auth } from "../services/api"
import { BinanceUser } from "../services/types"
import { useRef } from "react"

export function Header() {
  const loadedRef = useRef(false)
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [binanceAccounts, setBinanceAccounts] = useState<BinanceUser[]>([])
  const [currentBinanceUser, setCurrentBinanceUser] = useState<BinanceUser | null>(null)

  useEffect(() => {
    if (isAuthenticated && user && !loadedRef.current) {
      loadBinanceAccounts()
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
        } else {
          setCurrentBinanceUser(accounts[0])
        }
      } else if (accounts.length > 0) {
        setCurrentBinanceUser(accounts[0])
        if (user.id) {
          await userPreferences.updateCurrentBinanceUserId(user.id, accounts[0].id)
        }
      }
    } catch (error) {
      console.error("加载Binance账户失败:", error)
    }
  }

  const handleLogout = async () => {
    try {
      // 先调用Supabase的退出登录方法（包含完整的清理）
      await auth.logout()
      
      // 然后更新Redux状态
      dispatch(logout())
      
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

  return (
    <header className="w-full bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              {/* <img src="/logo.svg" alt="BisonSwap" className="h-8 w-8" /> */}
              <span className="text-xl font-bold text-foreground">Binance</span>
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
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
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Binance 账户切换 */}
                {binanceAccounts.length > 0 && (
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>切换账户</DropdownMenuLabel>
                      {binanceAccounts.map((account) => (
                        <DropdownMenuItem
                          key={account.id}
                          onClick={() => handleSwitchBinanceUser(account.id)}
                          className={currentBinanceUser?.id === account.id ? "bg-muted" : ""}
                        >
                          <Avatar className="h-5 w-5 mr-2">
                            {account.avatar_url ? (
                              <AvatarImage src={account.avatar_url} />
                            ) : (
                              <AvatarFallback>{getInitials(account.nickname)}</AvatarFallback>
                            )}
                          </Avatar>
                          <span>{account.nickname}</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center cursor-pointer">
                          <Plus className="mr-2 h-4 w-4" />
                          <span>管理账户</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </header>
  )
}