import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSpotTrading?: boolean;
  requireFutures?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireSpotTrading = false,
  requireFutures = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const restrictions = useSelector((state: RootState) => state.auth.currentUserRestrictions);

  // 如果正在加载权限信息，显示加载状态或者暂时保持当前页面
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 只有在restrictions已经加载完成且不满足权限要求时才重定向
  if (restrictions !== null) {
    // 检查是否有必要的交易权限
    if (requireSpotTrading && !restrictions?.enableSpotAndMarginTrading) {
      return <Navigate to="/" />;
    }

    // 检查是否有必要的合约权限
    if (requireFutures && !restrictions?.enableFutures) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
} 