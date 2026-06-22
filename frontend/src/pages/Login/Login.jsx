import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import * as authApi from '../../api/authApi';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email inválido.';
    if (!form.password) errs.password = 'La contraseña es obligatoria.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const { user, token } = await authApi.login(form.email, form.password);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">📦</div>
          <h2>StockFlow</h2>
          <p>Sistema de Gestión de Inventario</p>
        </div>

        {apiError && <div className="alert alert-error">🔒 {apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="admin@stockflow.com"
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowPass((p) => !p)}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión…' : '🔐 Iniciar sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem', padding: '1rem',
          background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem', color: 'var(--text-secondary)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--yellow)', marginBottom: '0.5rem' }}>Credenciales de demo:</p>
          <p>👑 Admin: <code>admin@stockflow.com</code> / <code>admin123</code></p>
          <p style={{ marginTop: '0.25rem' }}>👤 Operador: <code>operator@stockflow.com</code> / <code>operator123</code></p>
        </div>
      </div>
    </div>
  );
}
