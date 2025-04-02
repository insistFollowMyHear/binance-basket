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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const restrictions = useSelector((state: RootState) => state.auth.currentUserRestrictions);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // 检查是否有必要的交易权限
  if (requireSpotTrading && !restrictions?.enableSpotAndMarginTrading) {
    return <Navigate to="/" />;
  }

  // 检查是否有必要的合约权限
  if (requireFutures && !restrictions?.enableFutures) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
} 