import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useNavigate } from 'react-router-dom';
import * as reportsApi from '../../api/reportsApi';
import { Tabla } from '../../components/Tabla/Tabla';

export function Reportes() {
  const { request } = useApi();
  const navigate    = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await request(() => reportsApi.getLowStock());
      setProducts(data ?? []);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const criticidad = (p) => {
    if (p.stock === 0) return { label: 'Sin stock',   badge: 'badge-error',   pct: 0 };
    const pct = (p.stock / p.minStock) * 100;
    if (pct <= 50)    return { label: 'Crítico',      badge: 'badge-error',   pct };
    return              { label: 'Stock bajo',         badge: 'badge-warning', pct };
  };

  const columnas = [
    { key: 'name',     label: 'Producto',   render: (p) => <strong>{p.name}</strong> },
    { key: 'sku',      label: 'SKU',        render: (p) => <code style={{ color: 'var(--yellow)' }}>{p.sku}</code> },
    { key: 'category', label: 'Categoría',  render: (p) => p.category?.name ?? '—' },
    { key: 'price',    label: 'Precio',     render: (p) => `$${p.price.toFixed(2)}` },
    {
      key: 'stock',
      label: 'Stock actual',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--error)' : 'var(--warning)', minWidth: '24px' }}>
            {p.stock}
          </span>
          <div style={{ flex: 1, height: '6px', background: 'var(--bg-surface-3)', borderRadius: '999px', minWidth: '80px' }}>
            <div style={{
              width: `${Math.min(100, (p.stock / p.minStock) * 100)}%`,
              height: '100%', borderRadius: '999px',
              background: p.stock === 0 ? 'var(--error)' : 'var(--warning)',
            }} />
          </div>
        </div>
      ),
    },
    { key: 'minStock', label: 'Mínimo', render: (p) => <span style={{ color: 'var(--text-secondary)' }}>{p.minStock}</span> },
    { key: 'deficit',  label: 'Déficit', render: (p) => (
        <span style={{ color: 'var(--error)', fontWeight: 700 }}>
          −{p.minStock - p.stock}
        </span>
      )
    },
    { key: 'estado', label: 'Criticidad', render: (p) => {
        const { label, badge } = criticidad(p);
        return <span className={`badge ${badge}`}>{label}</span>;
      }
    },
  ];

  const sinStock   = products.filter((p) => p.stock === 0).length;
  const criticos   = products.filter((p) => p.stock > 0 && (p.stock / p.minStock) <= 0.5).length;
  const stockBajo  = products.filter((p) => p.stock > 0 && (p.stock / p.minStock) > 0.5).length;

  return (
    <>
      <div className="admin-content-header">
        <h1>Reporte de Stock Bajo</h1>
        <p>Productos cuyo stock es igual o inferior al mínimo configurado.</p>
      </div>

      {error && <div className="alert alert-error">⚠ {error}</div>}

      <div className="dashboard-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderColor: products.length > 0 ? 'var(--warning)' : 'var(--border-color)' }}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3 style={{ color: products.length > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{products.length}</h3>
            <p>Total productos con alerta</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderColor: sinStock > 0 ? 'var(--error)' : 'var(--border-color)' }}>
          <div className="stat-icon">🚫</div>
          <div className="stat-info">
            <h3 style={{ color: sinStock > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{sinStock}</h3>
            <p>Sin stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔴</div>
          <div className="stat-info">
            <h3 style={{ color: 'var(--error)' }}>{criticos}</h3>
            <p>Nivel crítico (≤ 50% del mínimo)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟡</div>
          <div className="stat-info">
            <h3 style={{ color: 'var(--warning)' }}>{stockBajo}</h3>
            <p>Stock bajo</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3>Productos con stock insuficiente ({products.length})</h3>
            {lastUpdate && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
              🔄 Actualizar
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/productos')}>
              Ir a productos →
            </button>
          </div>
        </div>

        {products.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Todo en orden</h3>
            <p>No hay productos con stock por debajo del mínimo configurado.</p>
          </div>
        ) : (
          <Tabla
            columns={columnas}
            data={[...products].sort((a, b) => a.stock - b.stock)}
            emptyMsg="No hay productos con stock bajo."
            loading={loading}
          />
        )}
      </div>
    </>
  );
}
