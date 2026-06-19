import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuestionBank from './pages/QuestionBank';
import AddQuestion from './pages/AddQuestion';
import Approvals from './pages/Approvals';
import GeneratePaper from './pages/GeneratePaper';
import PapersList from './pages/PapersList';
import PaperDetail from './pages/PaperDetail';

import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
