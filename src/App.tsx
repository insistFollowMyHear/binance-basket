import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Header } from './components/Header'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { SpotTrade } from './pages/spotTrading/index'
import { Profile } from './pages/Profile'
import { RequireAuth } from './components/RequireAuth'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'

// 路由定义为中心化的配置，更方便管理
const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> }
]

const protectedRoutes = [
  { path: '/profile', element: <Profile /> },
  // 添加其他需要身份验证的路由
  { path: '/spot', element: <SpotTrade /> }
]

// 应用入口组件，包含路由表和Redux Provider
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  )
}

// 实际的应用内容组件，可以使用hooks
function AppContent() {
  // 获取登录状态
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {isAuthenticated && <Header />}
      <Routes>
        {/* 公开路由 */}
        {publicRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        
        {/* 受保护的路由 */}
        {protectedRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<RequireAuth>{route.element}</RequireAuth>}
          />
        ))}
        
        {/* 首页重定向 */}
        <Route path="/" element={<Navigate to="/profile" replace />} />
        
        {/* 捕获所有未匹配的路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App