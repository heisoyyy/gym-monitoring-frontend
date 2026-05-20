import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BodyAnalysis from './pages/BodyAnalysis';
import WorkoutPlanner from './pages/WorkoutPlanner';
import Nutrition from './pages/Nutrition';
import AIChatbot from './pages/AIChatbot';
import AdminDashboard from './pages/AdminDashboard';
import useAuthStore from './store/useAuthStore';

// Wrapper untuk Proteksi Rute (Harus Login)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Wrapper untuk Proteksi Rute Khusus Admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Auth Publik */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Rute Terproteksi dengan Layout Utama */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/body-analysis" element={<BodyAnalysis />} />
          <Route path="/workout" element={<WorkoutPlanner />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/chat" element={<AIChatbot />} />
        </Route>

        {/* Rute Terproteksi Khusus Admin */}
        <Route
          element={
            <AdminRoute>
              <MainLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback ke Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
