import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { auth } from "../services"
import { setUser } from "../store/features/authSlice"

export function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { user } = await auth.register(email, password)

      if (user) {
        dispatch(setUser(user))
        navigate("/")
      } else {
        // 注册成功但需要验证邮箱的情况
        setError("注册成功，请检查您的邮箱进行验证")
      }
    } catch (error: any) {
      setError(error.message || "注册失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">注册 Binance</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            创建您的账户，开始交易之旅
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-6">
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
              <p className="mt-1 text-sm text-muted-foreground">
                密码至少需要8个字符
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "注册中..." : "注册"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}