import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import * as productsApi from '../../api/productsApi';
import * as ordersApi from '../../api/ordersApi';
import { Modal } from '../../components/Modal/Modal';

export function Pedidos() {
  const { request } = useApi();
  const navigate    = useNavigate();

  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [cart,          setCart]          = useState([]);
  const [modalProductos, setModalProductos] = useState(false);
  const [searchProd,    setSearchProd]    = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError,    setOrderError]    = useState('');
  const [buscarId,      setBuscarId]      = useState('');
  const [buscarError,   setBuscarError]   = useState('');

  useEffect(() => {
    request(() => productsApi.getAll())
      .then((data) => setProducts(data ?? []))
      .finally(() => setLoading(false));
  }, []);

  const productosFiltrados = products.filter((p) => {
    const q = searchProd.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && p.stock > 0;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const setQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId));

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCost  = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleCrearPedido = async () => {
    setCreatingOrder(true);
    setOrderError('');
    try {
      const items = cart.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
      for (const i of cart) {
        if (i.quantity > i.product.stock) {
          setOrderError(`Stock insuficiente para "${i.product.name}". Disponible: ${i.product.stock}.`);
          return;
        }
      }
      const order = await request(() => ordersApi.create(items));
      setCart([]);
      navigate(`/pedidos/${order.id}`);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!buscarId.trim()) return;
    setBuscarError('');
    try {
      await request(() => ordersApi.getById(Number(buscarId)));
      navigate(`/pedidos/${buscarId}`);
    } catch (err) {
      setBuscarError(err.message || `No se encontró el pedido #${buscarId}.`);
    }
  };

  return (
    <>
      <div className="admin-content-header">
        <h1>Pedidos</h1>
        <p>Creá nuevos pedidos de despacho o consultá uno existente.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div className="card">
            <div className="card-header">
              <h3>🛒 Nuevo pedido</h3>
              <button className="btn btn-primary" onClick={() => setModalProductos(true)} disabled={loading}>
                ➕ Agregar productos
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state" style={{ padding: '2.5rem' }}>
                <div className="empty-icon">🛒</div>
                <h3>Carrito vacío</h3>
                <p>Hacé clic en "Agregar productos" para seleccionar ítems.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.75rem', background: 'var(--bg-surface-2)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <code>{product.sku}</code> · ${product.price.toFixed(2)} c/u · Stock: {product.stock}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setQuantity(product.id, quantity - 1)}>−</button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(product.id, Number(e.target.value))}
                          className="form-input"
                          style={{ width: '60px', textAlign: 'center', padding: '0.35rem' }}
                        />
                        <button className="btn btn-sm btn-secondary" onClick={() => setQuantity(product.id, quantity + 1)}>+</button>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--yellow)', minWidth: '70px', textAlign: 'right' }}>
                        ${(product.price * quantity).toFixed(2)}
                      </div>
                      <button className="btn-icon" onClick={() => removeFromCart(product.id)} title="Quitar">✕</button>
                    </div>
                  ))}
                </div>

                {orderError && <div className="alert alert-error">⚠ {orderError}</div>}

                <div style={{
                  borderTop: '1px solid var(--border-color)', paddingTop: '1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{totalItems} ítem(s)</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--yellow)' }}>
                      Total: ${totalCost.toFixed(2)}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                    onClick={handleCrearPedido}
                    disabled={creatingOrder}
                  >
                    {creatingOrder ? 'Creando pedido…' : '✅ Confirmar pedido'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>🔍 Consultar pedido</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Ingresá el ID de un pedido para ver su estado y detalle.
          </p>
          <form onSubmit={handleBuscar}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="Ej: 1, 2, 3…"
                value={buscarId}
                onChange={(e) => { setBuscarId(e.target.value); setBuscarError(''); }}
              />
            </div>
            {buscarError && <div className="alert alert-error" style={{ marginBottom: '0.75rem' }}>⚠ {buscarError}</div>}
            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
              Buscar pedido →
            </button>
          </form>
        </div>
      </div>

      <Modal
        isOpen={modalProductos}
        onClose={() => { setModalProductos(false); setSearchProd(''); }}
        title="📦 Seleccionar productos"
        size="lg"
      >
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Buscar por nombre o SKU…"
          value={searchProd}
          onChange={(e) => setSearchProd(e.target.value)}
          style={{ marginBottom: '1rem' }}
          autoFocus
        />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
            {productosFiltrados.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Sin productos disponibles.</p>
            ) : (
              productosFiltrados.map((p) => {
                const inCart = cart.find((i) => i.product.id === p.id);
                return (
                  <div key={p.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', background: 'var(--bg-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${inCart ? 'var(--yellow)' : 'var(--border-color)'}`,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <code>{p.sku}</code> · ${p.price.toFixed(2)} · Stock: {p.stock}
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => addToCart(p)}
                    >
                      {inCart ? `En carrito (${inCart.quantity})` : '+ Agregar'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" onClick={() => { setModalProductos(false); setSearchProd(''); }}>
            Listo ({cart.length} producto(s) en carrito)
          </button>
        </div>
      </Modal>
    </>
  );
}
