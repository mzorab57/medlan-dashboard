import { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';
import { useToast } from '../store/toast';

export default function ProductVariantsManager({ productId, specs, onReload }) {
  const [rows, setRows] = useState(specs || []);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    sku_variant: '',
    spec_key: '',
    spec_value: '',
    price: '',
    stock: '',
    color_id: '',
    size_id: '',
    weight: '',
    is_active: 1,
  });

  const { add } = useToast();

  useEffect(() => {
    setRows(specs || []);
  }, [specs]);

  async function fetchMeta() {
    try {
      const cs = await api.get('/api/colors');
      const ss = await api.get('/api/sizes');
      setColors(cs.data || cs);
      setSizes(ss.data || ss);
    } catch (e) {
      void e;
    }
  }

  useEffect(() => {
    fetchMeta();
  }, []);

  const colorTotals = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const id = r.color_id;
      if (!id) return;
      const stock = Number(r.stock || 0);
      map[id] = (map[id] || 0) + stock;
    });
    return Object.entries(map).map(([id, total]) => ({ id: Number(id), total }));
  }, [rows]);

  const sizeTotals = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      const id = r.size_id;
      if (!id) return;
      const stock = Number(r.stock || 0);
      map[id] = (map[id] || 0) + stock;
    });
    return Object.entries(map).map(([id, total]) => ({ id: Number(id), total }));
  }, [rows]);

  function getColorName(id) {
    const c = colors.find((x) => x.id === id);
    return c?.name || `Color ${id}`;
  }
  function getSizeName(id) {
    const s = sizes.find((x) => x.id === id);
    return s?.name || `Size ${id}`;
  }

  function updateForm(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function createVariant(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      sku_variant: form.sku_variant || undefined,
      spec_key: form.spec_key || undefined,
      spec_value: form.spec_value || undefined,
      price: Number(form.price),
      stock: 0,
      color_id: form.color_id ? Number(form.color_id) : undefined,
      size_id: form.size_id ? Number(form.size_id) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      is_active: Number(form.is_active),
    };
    try {
      await api.post(`/api/products/${productId}/specs`, payload);
      if (onReload) await onReload();
      setForm({
        sku_variant: '',
        spec_key: '',
        spec_value: '',
        price: '',
        stock: '',
        color_id: '',
        size_id: '',
        weight: '',
        is_active: 1,
      });
      add('Variant created', 'success');
    } catch (e) {
      setError(e.message);
      add(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function saveRow(r) {
    const patch = {};
    if ((r.sku_variant || '').trim() !== '') patch.sku_variant = r.sku_variant.trim();
    if ((r.spec_key || '').trim() !== '') patch.spec_key = r.spec_key.trim();
    if ((r.spec_value || '').trim() !== '') patch.spec_value = r.spec_value.trim();
    if (r.price !== undefined && r.price !== null && String(r.price) !== '') patch.price = Number(r.price);
    // stock is managed via Stock page; do not patch here
    if (r.weight !== undefined && r.weight !== null && String(r.weight) !== '') patch.weight = Number(r.weight);
    if (r.color_id) patch.color_id = Number(r.color_id);
    if (r.size_id) patch.size_id = Number(r.size_id);
    patch.is_active = Number(r.is_active ? 1 : 0);
    try {
      await api.patch(`/api/specs?id=${r.id}`, patch);
      if (onReload) await onReload();
      add('Variant updated', 'success');
    } catch (e) {
      setError(e.message);
      add(e.message, 'error');
    }
  }

  async function deleteRow(id) {
    try {
      await api.del(`/api/specs?id=${id}`);
      if (onReload) await onReload();
      add('Deleting variant...', 'error', 1500);
    } catch (e) {
      setError(e.message);
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-4  ">
      <form onSubmit={createVariant} className="grid grid-cols-2   md:grid-cols-3 gap-2">
        <input className="rounded border px-2 py-1" placeholder="SKU Variant" value={form.sku_variant} onChange={(e) => updateForm('sku_variant', e.target.value)} />
        <input className="rounded border px-2 py-1" placeholder="Spec Key" value={form.spec_key} onChange={(e) => updateForm('spec_key', e.target.value)} />
        <input className="rounded border px-2 py-1" placeholder="Spec Value" value={form.spec_value} onChange={(e) => updateForm('spec_value', e.target.value)} />
        <input className="rounded border px-2 py-1" type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => updateForm('price', e.target.value)} required />
        <div className="px-2 py-1 text-sm text-gray-600">Stock is adjusted in Stock page</div>
        <select className="rounded border px-2 py-1" value={form.color_id} onChange={(e) => updateForm('color_id', e.target.value)}>
          <option value="">Color</option>
          {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="rounded border px-2 py-1" value={form.size_id} onChange={(e) => updateForm('size_id', e.target.value)}>
          <option value="">Size</option>
          {sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input className="rounded border px-2 py-1" type="number" step="0.01" placeholder="Weight" value={form.weight} onChange={(e) => updateForm('weight', e.target.value)} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => updateForm('is_active', e.target.checked ? 1 : 0)} />
          <span className="text-sm">Active</span>
        </label>
        <button disabled={loading} className="rounded bg-blue-600 text-white px-3 py-2 md:col-span-3">
          {loading ? 'Creating...' : 'Create Variant'}
        </button>
      </form>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="rounded overflow-x-auto py-4">
        <table className="w-full text-sm ">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-2 py-1">ID</th>
              <th className="text-left px-2 py-1">SKU</th>
              <th className="text-left px-2 py-1">Spec Key</th>
              <th className="text-left px-2 py-1">Spec Value</th>
              <th className="text-left px-2 py-1">Price</th>
              <th className="text-left px-2 py-1">Stock</th>
              <th className="text-left px-2 py-1">Weight</th>
              <th className="text-left px-2 py-1">Color</th>
              <th className="text-left px-2 py-1">Size</th>
              <th className="text-left px-2 py-1">Active</th>
              <th className="text-left px-2 py-1"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-2 py-1">{r.id}</td>
                <td className="px-2 py-1">
                  <input className="rounded border px-2 py-1 w-36" value={r.sku_variant || ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, sku_variant: e.target.value } : x))} />
                </td>
                <td className="px-2 py-1">
                  <input className="rounded border px-2 py-1 w-28" value={r.spec_key || ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, spec_key: e.target.value } : x))} />
                </td>
                <td className="px-2 py-1">
                  <input className="rounded border px-2 py-1 w-32" value={r.spec_value || ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, spec_value: e.target.value } : x))} />
                </td>
                <td className="px-2 py-1">
                  <input className="rounded border px-2 py-1 w-24" type="number" step="0.01" value={r.price} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, price: e.target.value } : x))} />
                </td>
                <td className="px-2 py-1">
                  <span className="font-mono">{r.stock ?? 0}</span>
                </td>
                <td className="px-2 py-1">
                  <input className="rounded border px-2 py-1 w-24" type="number" step="0.01" value={r.weight ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, weight: e.target.value } : x))} />
                </td>
                <td className="px-2 py-1">
                  <select className="rounded border px-2 py-1 w-28" value={r.color_id ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, color_id: e.target.value } : x))}>
                    <option value="">Color</option>
                    {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <select className="rounded border px-2 py-1 w-28" value={r.size_id ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, size_id: e.target.value } : x))}>
                    <option value="">Size</option>
                    {sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input type="checkbox" checked={!!r.is_active} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))} />
                </td>
                <td className="px-2 py-1">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => saveRow(r)}>Save</button>
                    <button className="px-3 py-1 rounded border border-red-500 text-red-600" onClick={() => deleteRow(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded border p-2">
          <div className="text-sm font-semibold mb-1">Stock by Color</div>
          <ul className="text-sm space-y-1">
            {colorTotals.length ? colorTotals.map((ct) => (
              <li key={ct.id} className="flex justify-between">
                <span>{getColorName(ct.id)}</span>
                <span className="font-mono">{ct.total}</span>
              </li>
            )) : <li className="text-gray-500">—</li>}
          </ul>
        </div>
        <div className="rounded border p-2">
          <div className="text-sm font-semibold mb-1">Stock by Size</div>
          <ul className="text-sm space-y-1">
            {sizeTotals.length ? sizeTotals.map((st) => (
              <li key={st.id} className="flex justify-between">
                <span>{getSizeName(st.id)}</span>
                <span className="font-mono">{st.total}</span>
              </li>
            )) : <li className="text-gray-500">—</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
