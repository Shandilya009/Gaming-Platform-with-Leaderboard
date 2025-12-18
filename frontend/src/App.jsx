import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Import page components
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import GamePlay from './pages/GamePlay';
import Leaderboard from './pages/Leaderboard';
import GameLeaderboard from './pages/GameLeaderboard';

import './App.css';

/**
 * AppContent Component
 * Contains the main application routing and layout logic
 * Must be inside AuthProvider to access authentication context
 */
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  /**
   * Determine whether to show the navbar
   * Hide navbar on certain pages for better user experience:
   * - Dashboard (has its own navigation)
   * - Games page (has its own navigation)
   * - Individual game pages (full-screen gaming experience)
   * - Leaderboard pages (focused viewing)
   */
  const shouldHideNavbar = () => {
    const currentPath = location.pathname;
    
    // Pages where navbar should be hidden
    const hideNavbarPaths = ['/dashboard', '/games', '/leaderboard'];
    
    // Check if current path starts with any of the hide paths
    const matchesHidePath = hideNavbarPaths.some(path => 
      currentPath.startsWith(path)
    );
    
    // Also hide on individual game pages (pattern: /game/:id)
    const isGamePage = currentPath.startsWith('/game/');
    
    return matchesHidePath || isGamePage;
  };

  return (
    <div className="app">
      {/* Show navbar only for authenticated users on appropriate pages */}
      {user && !shouldHideNavbar() && <Navbar />}
      
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          {/* Landing page - accessible to all users */}
          <Route path="/" element={<Landing />} />
          
          {/* Authentication routes - redirect to dashboard if already logged in */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />

          {/* Protected Routes - require authentication */}
          {/* User dashboard - main hub after login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Games listing page */}
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />
          
          {/* Individual game play page */}
          <Route
            path="/game/:id"
            element={
              <ProtectedRoute>
                <GamePlay />
              </ProtectedRoute>
            }
          />
          
          {/* Global leaderboard */}
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          
          {/* Game-specific leaderboard */}
          <Route
            path="/leaderboard/game/:gameId"
            element={
              <ProtectedRoute>
                <GameLeaderboard />
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all route - redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

/**
 * Main App Component
 * Sets up routing and authentication context for the entire application
 * 
 * Structure:
 * 1. Router - Enables client-side routing
 * 2. AuthProvider - Provides authentication context to all components
 * 3. AppContent - Contains the actual routing and layout logic
 */
function App() {
  // Use basename for GitHub Pages deployment
  const basename = import.meta.env.PROD ? '/Gaming-Platform-with-Leaderboard' : '';
  
  return (
    <Router basename={basename}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
