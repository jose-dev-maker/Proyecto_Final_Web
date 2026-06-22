import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import * as productsApi from '../../api/productsApi';
import { Modal } from '../../components/Modal/Modal';
import { Tabla } from '../../components/Tabla/Tabla';
import { ProductoForm } from '../../components/ProductoForm/ProductoForm';

export function Productos() {
  const { isAdmin } = useAuth();
  const { request } = useApi();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');

  const [modalCrear,    setModalCrear]    = useState(false);
  const [modalEditar,   setModalEditar]   = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');

  const toast = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3500); };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request(() => productsApi.getAll());
      setProducts(data ?? []);
      const cats = [];
      const seen = new Set();
      (data ?? []).forEach((p) => {
        if (p.category && !seen.has(p.category.id)) {
          seen.add(p.category.id);
          cats.push(p.category);
        }
      });
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleCrear = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      await request(() => productsApi.create(data));
      setModalCrear(false);
      await loadProducts();
      toast('Producto creado correctamente.');
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleEditar = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      await request(() => productsApi.update(modalEditar.id, data));
      setModalEditar(null);
      await loadProducts();
      toast('Producto actualizado correctamente.');
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const handleEliminar = async () => {
    setFormLoading(true);
    try {
      await request(() => productsApi.remove(modalEliminar.id));
      setModalEliminar(null);
      await loadProducts();
      toast('Producto eliminado correctamente.');
    } catch (err) { setFormError(err.message); }
    finally { setFormLoading(false); }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category?.name.toLowerCase().includes(q);
  });

  const stockBadge = (p) => {
    if (p.stock === 0)         return <span className="badge badge-error">Sin stock</span>;
    if (p.stock <= p.minStock) return <span className="badge badge-warning">Stock bajo</span>;
    return <span className="badge badge-success">OK</span>;
  };

  const columnas = [
    { key: 'name',     label: 'Producto',  render: (p) => <strong>{p.name}</strong> },
    { key: 'sku',      label: 'SKU',       render: (p) => <code style={{ color: 'var(--yellow)' }}>{p.sku}</code> },
    { key: 'category', label: 'Categoría', render: (p) => p.category?.name ?? '—' },
    { key: 'price',    label: 'Precio',    render: (p) => `$${p.price.toFixed(2)}` },
    { key: 'stock',    label: 'Stock',     render: (p) => (
        <span style={{ fontWeight: 700, color: p.stock <= p.minStock ? 'var(--error)' : 'var(--success)' }}>
          {p.stock}
        </span>
      )
    },
    { key: 'minStock', label: 'Mín.',      render: (p) => <span style={{ color: 'var(--text-muted)' }}>{p.minStock}</span> },
    { key: 'estado',   label: 'Estado',    render: stockBadge },
    ...(isAdmin ? [{
      key: 'acciones', label: 'Acciones',
      render: (p) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => { setFormError(''); setModalEditar(p); }}>✏️</button>
          <button className="btn btn-sm btn-danger" onClick={() => setModalEliminar(p)}>🗑</button>
        </div>
      ),
    }] : []),
  ];

  return (
    <>
      <div className="admin-content-header">
        <h1>Productos</h1>
        <p>{isAdmin ? 'Gestión completa del inventario.' : 'Catálogo de productos disponibles.'}</p>
      </div>

      {successMsg && <div className="alert alert-success">✅ {successMsg}</div>}

      <div className="card">
        <div className="card-header">
          <h3>Inventario ({filtered.length})</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Buscar producto, SKU o categoría…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '260px' }}
            />
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => { setFormError(''); setModalCrear(true); }}>
                ➕ Nuevo producto
              </button>
            )}
          </div>
        </div>

        <Tabla
          columns={columnas}
          data={[...filtered].sort((a, b) => a.name.localeCompare(b.name))}
          emptyMsg={search ? `Sin resultados para "${search}".` : 'No hay productos registrados.'}
          loading={loading}
        />
      </div>

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="➕ Nuevo producto" size="lg">
        <ProductoForm
          categories={categories}
          onSubmit={handleCrear}
          onCancel={() => setModalCrear(false)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      <Modal isOpen={!!modalEditar} onClose={() => setModalEditar(null)} title="✏️ Editar producto" size="lg">
        <ProductoForm
          initialData={modalEditar}
          categories={categories}
          onSubmit={handleEditar}
          onCancel={() => setModalEditar(null)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      <Modal
        isOpen={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        title="🗑 Eliminar producto"
        size="sm"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalEliminar(null)} disabled={formLoading}>Cancelar</button>
            <button className="btn btn-danger" onClick={handleEliminar} disabled={formLoading}>
              {formLoading ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
          </>
        }
      >
        {modalEliminar && (
          <>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              ¿Eliminar <strong style={{ color: 'var(--text-primary)' }}>{modalEliminar.name}</strong>?
              Esta acción no se puede deshacer.
            </p>
            {formError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>⚠ {formError}</div>}
          </>
        )}
      </Modal>
    </>
  );
}
