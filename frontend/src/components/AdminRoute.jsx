import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminRoute Component
 * 
 * A wrapper component that protects admin routes.
 * If user is not authenticated, redirects to login page.
 * If user is not admin, redirects to dashboard.
 * If user is admin, renders the child components.
 */
function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is not admin, redirect to dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is admin, render the protected content
  return children;
}

export default AdminRoute;
