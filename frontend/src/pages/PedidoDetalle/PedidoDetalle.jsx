import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import * as ordersApi from '../../api/ordersApi';

const STATUS_LABEL = {
  PENDING:    { label: 'Pendiente',  badge: 'badge-warning', icon: '⏳' },
  DISPATCHED: { label: 'Despachado', badge: 'badge-success', icon: '🚚' },
  CANCELLED:  { label: 'Cancelado',  badge: 'badge-error',   icon: '❌' },
};

const NEXT_STATUSES = {
  PENDING:    ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['CANCELLED'],
  CANCELLED:  [],
};

export function PedidoDetalle() {
  const { id }      = useParams();
  const { isAdmin } = useAuth();
  const { request } = useApi();
  const navigate    = useNavigate();

  const [order,          setOrder]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError,    setStatusError]    = useState('');
  const [statusMsg,      setStatusMsg]      = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const data = await request(() => ordersApi.getById(Number(id)));
        setOrder(data);
      } catch (err) {
        setError(err.message || `No se encontró el pedido #${id}.`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true); setStatusError('');
    try {
      const updated = await request(() => ordersApi.updateStatus(Number(id), newStatus));
      setOrder(updated);
      setStatusMsg(`Estado actualizado a "${STATUS_LABEL[newStatus]?.label}".`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/pedidos')}>← Volver a pedidos</button>
      </>
    );
  }

  const statusInfo  = STATUS_LABEL[order.status] ?? {};
  const nextOptions = NEXT_STATUSES[order.status] ?? [];
  const total       = order.items.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pedidos')} style={{ marginBottom: '0.75rem' }}>
            ← Volver
          </button>
          <h1 style={{ fontSize: '1.8rem' }}>Pedido #{order.id}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Creado el {formatDate(order.createdAt)} · Operador: {order.operator?.email}
          </p>
        </div>
        <span className={`badge ${statusInfo.badge}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
          {statusInfo.icon} {statusInfo.label}
        </span>
      </div>

      {statusMsg   && <div className="alert alert-success">✅ {statusMsg}</div>}
      {statusError && <div className="alert alert-error">⚠ {statusError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <h3>📋 Ítems del pedido</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {order.items.length} producto(s)
            </span>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Precio unitario</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.product?.name ?? `Producto #${item.productId}`}</strong></td>
                    <td><code style={{ color: 'var(--yellow)' }}>{item.product?.sku ?? '—'}</code></td>
                    <td>${item.priceAtOrder.toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ fontWeight: 700, color: 'var(--yellow)' }}>
                      ${(item.priceAtOrder * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, padding: '0.9rem 1rem' }}>TOTAL</td>
                  <td style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--yellow)', padding: '0.9rem 1rem' }}>
                    ${total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>⚙️ Acciones</h3>

          <div style={{ marginBottom: '1rem' }}>
            <p className="form-label">Estado actual</p>
            <span className={`badge ${statusInfo.badge}`} style={{ fontSize: '0.875rem', padding: '0.35rem 0.8rem' }}>
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>

          {isAdmin && nextOptions.length > 0 && (
            <div>
              <p className="form-label" style={{ marginBottom: '0.5rem' }}>Cambiar estado</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {nextOptions.map((s) => {
                  const info = STATUS_LABEL[s];
                  return (
                    <button
                      key={s}
                      className={`btn ${s === 'CANCELLED' ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleStatusChange(s)}
                      disabled={updatingStatus}
                    >
                      {info.icon} Marcar como {info.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!isAdmin && order.status === 'PENDING' && (
            <div>
              <p className="form-label" style={{ marginBottom: '0.5rem' }}>Cambiar estado</p>
              <button className="btn btn-danger" onClick={() => handleStatusChange('CANCELLED')} disabled={updatingStatus}>
                ❌ Cancelar pedido
              </button>
            </div>
          )}

          {order.status === 'CANCELLED' && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Este pedido está cancelado y no puede modificarse. El stock fue restaurado.
            </p>
          )}

          {order.status === 'DISPATCHED' && !isAdmin && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Este pedido ya fue despachado.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
