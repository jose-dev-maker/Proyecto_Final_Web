import { useState, useEffect } from 'react';

const empty = { name: '', sku: '', stock: '', minStock: '', price: '', categoryId: '' };

export function ProductoForm({ initialData = null, categories = [], onSubmit, onCancel, loading = false, error }) {
  const [form, setForm]     = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(
      initialData
        ? {
            name:       initialData.name       ?? '',
            sku:        initialData.sku        ?? '',
            stock:      initialData.stock      ?? '',
            minStock:   initialData.minStock   ?? '',
            price:      initialData.price      ?? '',
            categoryId: initialData.categoryId ?? '',
          }
        : empty
    );
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())              errs.name       = 'El nombre es obligatorio.';
    if (!form.sku.trim())               errs.sku        = 'El SKU es obligatorio.';
    if (form.stock === '')              errs.stock      = 'El stock es obligatorio.';
    else if (Number(form.stock) < 0)   errs.stock      = 'El stock no puede ser negativo.';
    if (form.minStock === '')           errs.minStock   = 'El stock mínimo es obligatorio.';
    else if (Number(form.minStock) < 0) errs.minStock  = 'El stock mínimo no puede ser negativo.';
    if (form.price === '')              errs.price      = 'El precio es obligatorio.';
    else if (Number(form.price) <= 0)  errs.price      = 'El precio debe ser mayor a 0.';
    if (!form.categoryId)               errs.categoryId = 'Seleccioná una categoría.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await onSubmit({
      name:       form.name.trim(),
      sku:        form.sku.trim().toUpperCase(),
      stock:      Number(form.stock),
      minStock:   Number(form.minStock),
      price:      Number(form.price),
      categoryId: Number(form.categoryId),
    });
  };

  const field = (name, label, type = 'text', extra = {}) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`form-input${errors[name] ? ' error' : ''}`}
        {...extra}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="alert alert-error">⚠ {error}</div>}

      {field('name', 'Nombre del producto', 'text', { placeholder: 'Ej: Laptop Dell Inspiron' })}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {field('sku', 'SKU', 'text', { placeholder: 'Ej: LAPTOP-001' })}

        <div className="form-group">
          <label className="form-label">Categoría</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className={`form-select${errors.categoryId ? ' error' : ''}`}
          >
            <option value="">Seleccioná…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {field('stock',    'Stock actual', 'number', { min: 0 })}
        {field('minStock', 'Stock mínimo', 'number', { min: 0 })}
        {field('price',    'Precio ($)',   'number', { min: 0, step: '0.01' })}
      </div>

      <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Guardando…' : initialData ? '💾 Guardar cambios' : '➕ Crear producto'}
        </button>
      </div>
    </form>
  );
}
