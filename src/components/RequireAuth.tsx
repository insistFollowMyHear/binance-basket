import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { auth } from '../services/api'
import { setUser } from '../store/features/authSlice'
import { Loading } from './ui/loading'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [localCheckDone, setLocalCheckDone] = useState(false)

  // 检查本地存储中是否有Supabase token
  useEffect(() => {
    const checkLocalToken = async () => {
      // 如果已认证，则跳过本地检查
      if (isAuthenticated) {
        setLocalCheckDone(true)
        return
      }

      // 如果正在加载，则等待加载完成
      if (loading) {
        return
      }

      try {
        // 额外检查：获取当前用户
        const user = await auth.getCurrentUser()
        if (user) {
          dispatch(setUser(user))
          setLocalCheckDone(true)
          return
        }
      } catch (error) {
        console.error('本地检查授权失败:', error)
      }

      // 如果没有找到有效用户，标记本地检查完成
      setLocalCheckDone(true)
    }

    checkLocalToken()
  }, [isAuthenticated, loading, dispatch])

  // 重定向逻辑
  useEffect(() => {
    // 只有在本地检查完成并且确定未认证时才重定向
    if (localCheckDone && !loading && !isAuthenticated) {
      console.log('需要认证，重定向到登录页面')
      // 将当前路径保存在state中，以便登录后可以重定向回来
      navigate('/login', { state: { from: location.pathname }, replace: true })
    }
  }, [isAuthenticated, loading, navigate, location, localCheckDone])

  if (loading || !localCheckDone) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loading size="lg" text="验证身份中..." />
      </div>
    )
  }

  // 只有通过认证才渲染子组件
  return isAuthenticated ? <>{children}</> : null
} 