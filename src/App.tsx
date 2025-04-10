import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { Header } from './components/Header'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { SpotTrade } from './pages/spotTrading/index'
// import { CoinFutures } from './pages/futures/coinFutures'
import { UsdsFutures } from './pages/futures/usdsFutures'
import { Profile } from './pages/Profile'
import { RequireAuth } from './components/RequireAuth'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'
import { Toaster } from './components/ui/toaster'

// 路由定义为中心化的配置，更方便管理
const publicRoutes = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> }
]

const protectedRoutes = [
  { 
    path: '/profile', 
    element: <Profile /> 
  },
  { 
    path: '/spot', 
    element: <SpotTrade />,
    requireSpotTrading: true
  },
  {
    path: '/futures/usdt',
    element: <UsdsFutures />,
    requireFutures: true
  },
  // {
  //   path: '/futures/coin',
  //   element: <CoinFutures />,
  //   requireFutures: true
  // }
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
      <Toaster />
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
            element={
              <RequireAuth>
                <ProtectedRoute
                  requireSpotTrading={route.requireSpotTrading}
                  // requireFutures={route.requireFutures}
                >
                  {route.element}
                </ProtectedRoute>
              </RequireAuth>
            }
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