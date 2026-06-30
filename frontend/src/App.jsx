import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import AddQuestion from './pages/AddQuestion';
import QuestionHistory from './pages/QuestionHistory';
import Approvals from './pages/Approvals';
import GeneratePaper from './pages/GeneratePaper';
import PapersList from './pages/PapersList';
import PaperDetail from './pages/PaperDetail';
import Analytics from './pages/Analytics';
import Departments from './pages/Departments';

import './styles/global.css';
import './styles/global_additions.css';
import './styles/dark-mode.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/questions" element={<QuestionBank />} />
              <Route
                path="/questions/add"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                    <AddQuestion />
                  </ProtectedRoute>
                }
              />
              <Route path="/questions/:id/history" element={<QuestionHistory />} />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={['hod', 'admin']}>
                    <Approvals />
                  </ProtectedRoute>
                }
              />
              <Route path="/papers" element={<PapersList />} />
              <Route
                path="/papers/generate"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'examcell', 'admin']}>
                    <GeneratePaper />
                  </ProtectedRoute>
                }
              />
              <Route path="/papers/:id" element={<PaperDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Departments />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
