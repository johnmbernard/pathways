import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
