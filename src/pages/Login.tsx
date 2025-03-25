import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { auth } from "../services"
import { setUser } from "../store/features/authSlice"

export function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  // 获取原始导航的路径
  const from = location.state?.from || "/"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { user } = await auth.login(email, password)

      if (user) {
        dispatch(setUser(user))
        // 登录成功后重定向到原始请求的路径
        navigate(from, { replace: true })
      }
    } catch (error: any) {
      setError(error.message || "登录失败，请检查您的凭据")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">登录到 Binance</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            开启您的加密货币交易之旅
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                邮箱地址
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            还没有账号？{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">
              立即注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}