import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication.
 * If user is not authenticated, redirects to login page.
 * If user is authenticated, renders the child components.
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @param {React.ReactNode} children - Components to render if authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is authenticated, render the protected content
  return children;
}

export default ProtectedRoute;
