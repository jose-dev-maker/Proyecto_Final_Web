import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import * as productsApi from '../../api/productsApi';
import * as reportsApi from '../../api/reportsApi';

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { request }       = useApi();
  const navigate          = useNavigate();

  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const prods = await request(() => productsApi.getAll());
        setProducts(prods ?? []);
        if (isAdmin) {
          const low = await request(() => reportsApi.getLowStock());
          setLowStock(low ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAdmin]);

  const totalProductos  = products.length;
  const valorInventario = products.reduce((s, p) => s + p.price * p.stock, 0);
  const totalUnidades   = products.reduce((s, p) => s + p.stock, 0);
  const stockBajo       = lowStock.length;

  const stats = [
    { icon: '📦', value: totalProductos,                   label: 'Productos registrados' },
    { icon: '📊', value: totalUnidades,                    label: 'Unidades en stock total' },
    { icon: '💰', value: `$${valorInventario.toFixed(2)}`, label: 'Valor del inventario' },
    ...(isAdmin
      ? [{ icon: '⚠️', value: stockBajo, label: 'Productos con stock bajo', alert: stockBajo > 0 }]
      : []),
  ];

  return (
    <>
      <div className="admin-content-header">
        <h1>Dashboard</h1>
        <p>
          Bienvenido, <strong style={{ color: 'var(--yellow)' }}>{user?.email}</strong>
          {' '}·{' '}
          <span className={`badge ${isAdmin ? 'badge-yellow' : 'badge-default'}`}>{user?.role}</span>
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat-card" style={s.alert ? { borderColor: 'var(--error)' } : {}}>
                <div className="stat-icon" style={s.alert ? { background: 'var(--error-bg)' } : {}}>
                  {s.icon}
                </div>
                <div className="stat-info">
                  <h3 style={s.alert ? { color: 'var(--error)' } : {}}>{s.value}</h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {isAdmin && stockBajo > 0 && (
            <div
              className="alert alert-warning"
              style={{ cursor: 'pointer', marginBottom: '1.5rem' }}
              onClick={() => navigate('/reportes')}
            >
              ⚠️ Hay <strong>{stockBajo}</strong> producto(s) con stock por debajo del mínimo.{' '}
              <u>Ver reporte →</u>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '1.25rem' }}>
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/productos')}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📦</div>
              <h3 style={{ marginBottom: '0.4rem' }}>Productos</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isAdmin ? 'Crear, editar y eliminar productos del inventario.' : 'Ver el catálogo de productos disponibles.'}
              </p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Ir a productos →</button>
            </div>

            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/pedidos')}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🛒</div>
              <h3 style={{ marginBottom: '0.4rem' }}>Pedidos</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Crear nuevos pedidos de despacho y consultar el estado de un pedido.
              </p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Ir a pedidos →</button>
            </div>

            {isAdmin && (
              <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/reportes')}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
                <h3 style={{ marginBottom: '0.4rem' }}>Reportes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Ver productos con stock igual o por debajo del mínimo configurado.
                </p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Ver reportes →</button>
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <div className="card-header">
                <h3>📉 Productos con menos stock</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/productos')}>
                  Ver todos
                </button>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th><th>SKU</th><th>Categoría</th><th>Stock</th><th>Mínimo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...products].sort((a, b) => a.stock - b.stock).slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td><code style={{ color: 'var(--yellow)' }}>{p.sku}</code></td>
                        <td>{p.category?.name ?? '—'}</td>
                        <td>
                          <span style={{ color: p.stock <= p.minStock ? 'var(--error)' : 'var(--success)', fontWeight: 600 }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.minStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
