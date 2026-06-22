import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navClass = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <h2>📦 StockFlow</h2>
          <p>{user?.email}</p>
          <span
            className={`badge ${isAdmin ? 'badge-yellow' : 'badge-default'}`}
            style={{ marginTop: '0.4rem', display: 'inline-block' }}
          >
            {user?.role}
          </span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/dashboard" className={navClass}>
            <span className="nav-icon">🏠</span> Dashboard
          </NavLink>

          <NavLink to="/productos" className={navClass}>
            <span className="nav-icon">📦</span> Productos
          </NavLink>

          <NavLink to="/pedidos" className={navClass}>
            <span className="nav-icon">🛒</span> Pedidos
          </NavLink>

          {isAdmin && (
            <NavLink to="/reportes" className={navClass}>
              <span className="nav-icon">📊</span> Reportes
            </NavLink>
          )}

          <div style={{ flex: 1 }} />

          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Cerrar sesión
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
