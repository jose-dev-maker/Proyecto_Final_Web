import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Productos } from './pages/Productos/Productos';
import { Pedidos } from './pages/Pedidos/Pedidos';
import { PedidoDetalle } from './pages/PedidoDetalle/PedidoDetalle';
import { Reportes } from './pages/Reportes/Reportes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/productos"   element={<Productos />} />
            <Route path="/pedidos"     element={<Pedidos />} />
            <Route path="/pedidos/:id" element={<PedidoDetalle />} />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Reportes />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
