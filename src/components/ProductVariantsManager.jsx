import React, { useEffect, useState, useMemo } from 'react';
import { api, API_BASE } from '../lib/api';
import { useToast } from '../store/toast';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;
function assetUrl(p) {
  const rel = String(p || '').replace(/^\/+/, '');
  return `${ASSET_BASE}/${rel}`;
}
export default function ProductVariantsManager({ productId, specs, onReload }) {
  const [rows, setRows] = useState(specs || []);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [basePrice, setBasePrice] = useState(null);
  const [createImageFile, setCreateImageFile] = useState(null);
  const [form, setForm] = useState({
    sku_variant: '',
    spec_key: '',
    spec_value: '',
    price: '',
    stock: '',
    color_id: '',
    size_id: '',
    gender: '',
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

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/products?id=${productId}`);
        const p = res.product || res;
        setBasePrice(p && p.base_price != null ? Number(p.base_price) : null);
      } catch {
        setBasePrice(null);
      }
    })();
  }, [productId]);

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

  const [imagesMap, setImagesMap] = useState({});
  const [openImages, setOpenImages] = useState({});
  const [uploadingMap, setUploadingMap] = useState({});

  async function loadSpecImages(specId) {
    try {
      const res = await api.get(`/api/specs/${specId}/images`);
      const list = res.data?.data || res.data || res || [];
      setImagesMap((m) => ({ ...m, [specId]: list }));
    } catch { setImagesMap((m) => ({ ...m, [specId]: [] })); }
  }

  async function uploadSpecImage(specId, e) {
    e.preventDefault();
    const f = e.target;
    const file = f.image.files[0];
    if (!file) return;
    setUploadingMap((m) => ({ ...m, [specId]: true }));
    const fd = new FormData();
    fd.append('image', file);
    fd.append('alt_text', f.alt_text.value || '');
    fd.append('sort_order', f.sort_order.value || '0');
    fd.append('is_primary', f.is_primary.checked ? '1' : '0');
    try {
      const created = await api.postForm(`/api/specs/${specId}/images`, fd);
      setImagesMap((m) => {
        const cur = m[specId] || [];
        const next = [
          ...cur,
          { id: created.id, spec_id: specId, image: created.image, alt_text: f.alt_text.value || '', sort_order: Number(f.sort_order.value || 0), is_primary: f.is_primary.checked ? 1 : 0 },
        ];
        return { ...m, [specId]: next };
      });
      f.reset();
      add('Image uploaded', 'success');
    } catch (e) { add(e.message, 'error'); }
    finally { setUploadingMap((m) => ({ ...m, [specId]: false })); }
  }

  async function deleteSpecImage(imageId, specId) {
    try {
      await api.del(`/api/spec-images?id=${imageId}`);
      await loadSpecImages(specId);
      add('Deleting image...', 'error', 1200);
    } catch (e) { add(e.message, 'error'); }
  }

  async function setPrimarySpecImage(imageId, specId) {
    try {
      await api.patch(`/api/spec-images?id=${imageId}`, {});
      await loadSpecImages(specId);
      add('Primary set', 'success');
    } catch (e) { add(e.message, 'error'); }
  }
  async function createVariant(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      sku_variant: form.sku_variant || undefined,
      spec_key: form.spec_key || undefined,
      spec_value: form.spec_value || undefined,
      price: form.price !== '' ? Number(form.price) : Number(basePrice || 0),
      purchase_price: form.purchase_price !== '' ? Number(form.purchase_price) : undefined,
      stock: form.stock !== '' ? Number(form.stock) : 0, // STOCK زیاد کرا
      gender: form.gender || undefined,
      color_id: form.color_id ? Number(form.color_id) : undefined,
      size_id: form.size_id ? Number(form.size_id) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      is_active: Number(form.is_active),
    };
    try {
      const resp = await api.post(`/api/products/${productId}/specs`, payload);
      const newId = resp?.id || resp?.data?.id;
      let createdImage = null;
      if (newId && createImageFile) {
        const fd = new FormData();
        fd.append('image', createImageFile);
        fd.append('is_primary', '0');
        createdImage = await api.postForm(`/api/specs/${newId}/images`, fd);
      }
      if (onReload) await onReload();
      if (newId) {
        if (createdImage && createdImage.image) {
          setImagesMap((m) => {
            const cur = m[newId] || [];
            const next = [
              ...cur,
              { id: createdImage.id, spec_id: newId, image: createdImage.image, alt_text: '', sort_order: 0, is_primary: 0 },
            ];
            return { ...m, [newId]: next };
          });
        }
        setOpenImages((prev) => ({ ...prev, [newId]: true }));
      }
      setForm({
        sku_variant: '',
        spec_key: '',
        spec_value: '',
        price: '',
        purchase_price: '',
        stock: '', // خاڵی کرا
        color_id: '',
        size_id: '',
        gender: '',
        is_active: 1,
      });
      setCreateImageFile(null);
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
    if (r.purchase_price !== undefined && r.purchase_price !== null && String(r.purchase_price) !== '') patch.purchase_price = Number(r.purchase_price);
    
    // STOCK editable کرا
    if (r.stock !== undefined && r.stock !== null && String(r.stock) !== '') {
      patch.stock = Number(r.stock);
    }
    
    if (r.gender !== undefined) patch.gender = r.gender;
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
      add('Variant deleted', 'success');
    } catch (e) {
      setError(e.message);
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createVariant} className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <input 
          className="rounded border px-2 py-1" 
          placeholder="SKU Variant" 
          value={form.sku_variant} 
          onChange={(e) => updateForm('sku_variant', e.target.value)} 
        />
        <input 
          className="rounded border px-2 py-1" 
          placeholder="Spec Key" 
          value={form.spec_key} 
          onChange={(e) => updateForm('spec_key', e.target.value)} 
        />
        <input 
          className="rounded border px-2 py-1" 
          placeholder="Spec Value" 
          value={form.spec_value} 
          onChange={(e) => updateForm('spec_value', e.target.value)} 
        />
        <input 
          className="rounded border px-2 py-1" 
          type="number" 
          step="0.01" 
          placeholder={basePrice != null ? `Price (defaults ${basePrice})` : "Price"} 
          value={form.price} 
          onChange={(e) => updateForm('price', e.target.value)} 
        />
        <input 
          className="rounded border px-2 py-1" 
          type="number" 
          placeholder="Stock" 
          value={form.stock} 
          onChange={(e) => updateForm('stock', e.target.value)} 
        />
        <select 
          className="rounded border px-2 py-1" 
          value={form.color_id} 
          onChange={(e) => updateForm('color_id', e.target.value)}
          // required
        >
          <option value="">Color</option>
          {colors.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select 
          className="rounded border px-2 py-1" 
          value={form.size_id} 
          onChange={(e) => updateForm('size_id', e.target.value)}
        >
          <option value="">Size</option>
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select 
          className="rounded border px-2 py-1" 
          value={form.gender ?? ''} 
          onChange={(e) => updateForm('gender', e.target.value)}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <div className="flex items-center">
          <input 
            type="file" 
            accept="image/*" 
            className="w-full text-sm"
            onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={!!form.is_active} 
            onChange={(e) => updateForm('is_active', e.target.checked ? 1 : 0)} 
          />
          <span className="text-sm">Active</span>
        </label>
        <button 
          disabled={loading} 
          className="rounded bg-blue-600 text-white px-3 py-2 md:col-span-3"
        >
          {loading ? 'Creating...' : 'Create Variant'}
        </button>
      </form>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="rounded overflow-x-auto py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-2 py-1">ID</th>
              <th className="text-left px-2 py-1">SKU</th>
              <th className="text-left px-2 py-1">Spec Key</th>
              <th className="text-left px-2 py-1">Spec Value</th>
              <th className="text-left px-2 py-1">Price</th>
              <th className="text-left px-2 py-1">Purchase</th>
              <th className="text-left px-2 py-1">Stock</th>
              <th className="text-left px-2 py-1">Gender</th>
              <th className="text-left px-2 py-1">Color</th>
              <th className="text-left px-2 py-1">Size</th>
              <th className="text-left px-2 py-1">Active</th>
              <th className="text-left px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <React.Fragment key={r.id}>
              <tr className="border-t">
                <td className="px-2 py-1">{r.id}</td>
                <td className="px-2 py-1">
                  <input 
                    className="rounded border px-2 py-1 w-36" 
                    value={r.sku_variant || ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, sku_variant: e.target.value } : x))}
                  />
                </td>
                <td className="px-2 py-1">
                  <input 
                    className="rounded border px-2 py-1 w-28" 
                    value={r.spec_key || ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, spec_key: e.target.value } : x))}
                  />
                </td>
                <td className="px-2 py-1">
                  <input 
                    className="rounded border px-2 py-1 w-32" 
                    value={r.spec_value || ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, spec_value: e.target.value } : x))}
                  />
                </td>
                <td className="px-2 py-1">
                  <input 
                    className="rounded border px-2 py-1 w-24" 
                    type="number" 
                    step="0.01" 
                    value={r.price} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, price: e.target.value } : x))}
                  />
                </td>
                <td className="px-2 py-1">
                  <input 
                    className="rounded border px-2 py-1 w-24" 
                    type="number" 
                    step="0.01" 
                    value={r.purchase_price ?? ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, purchase_price: e.target.value } : x))}
                  />
                </td>
                {/* STOCK editable کرا */}
                <td className="px-2 py-1">
                  <input 
                    className="rounded border px-2 py-1 w-24 font-mono" 
                    type="number" 
                    value={r.stock ?? 0} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, stock: e.target.value } : x))}
                  />
                </td>
                <td className="px-2 py-1">
                  <select 
                    className="rounded border px-2 py-1 w-28" 
                    value={r.gender ?? ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, gender: e.target.value } : x))}
                  >
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </td>
                <td className="px-2 py-1" required>
                  <select 
                    required
                    className="rounded border px-2 py-1 w-28" 
                    value={r.color_id ?? ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, color_id: e.target.value } : x))}
                  >
                    <option value="" >Color</option>
                    {colors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <select 
                    className="rounded border px-2 py-1 w-28" 
                    value={r.size_id ?? ''} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, size_id: e.target.value } : x))}
                  >
                    <option value="">Size</option>
                    {sizes.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input 
                    type="checkbox" 
                    checked={!!r.is_active} 
                    onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))}
                  />
                </td>
                <td className="px-2 py-1">
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1 rounded bg-blue-600 text-white text-xs" 
                      onClick={() => saveRow(r)}
                    >
                      Save
                    </button>
                    <button 
                      className="px-3 py-1 rounded border border-red-500 text-red-600 text-xs" 
                      onClick={() => deleteRow(r.id)}
                    >
                      Delete
                    </button>
                    <button 
                      className="px-3 py-1 rounded border border-gray-300 text-gray-700 text-xs"
                      onClick={() => {
                        const willOpen = !openImages[r.id];
                        setOpenImages((prev) => ({ ...prev, [r.id]: willOpen }));
                        if (willOpen) loadSpecImages(r.id);
                      }}
                    >
                      Images
                    </button>
                  </div>
                </td>
              </tr>
              {openImages[r.id] && (
                <tr>
                  <td className="px-2 py-2" colSpan={11}>
                    <div className="grid rev grid-cols-1 md:grid-cols-3 gridc gap-3">
                      <div className="md:col-span-2">
                        <div className="text-lg font-bold mb-2">Variant Images</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
                          {(imagesMap[r.id] || []).map(img => (
                            <div key={img.id} className="group  relative rounded border overflow-hidden">
                                <img src={assetUrl(img.image)} className="w-full  h-24 object-cover" alt="" onError={(e) => { e.currentTarget.style.display='none'; }} />
                              {img.is_primary ? <span className="absolute top-1 left-1 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded">Primary</span> : null}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                {!img.is_primary && (
                                  <button onClick={() => setPrimarySpecImage(img.id, r.id)} className="px-2 py-1 bg-white text-xs rounded">Set Primary</button>
                                )}
                                <button onClick={() => deleteSpecImage(img.id, r.id)} className="px-2 py-1 bg-red-600 text-white text-xs rounded">Delete</button>
                              </div>
                            </div>
                          ))}
                          {(!imagesMap[r.id] || imagesMap[r.id].length === 0) && <div className="text-sm text-gray-500">No images</div>}
                        </div>
                      </div>
                      <div>
                        <form onSubmit={(e) => uploadSpecImage(r.id, e)} className="border rounded p-2 space-y-2">
                          <div>
                            <label className="text-xs text-gray-500">Image</label>
                            <input type="file" name="image" className="w-full border rounded p-1 text-sm" required />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500">Sort</label>
                              <input type="number" name="sort_order" defaultValue="0" className="w-full border rounded px-2 py-1 text-sm" />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2">
                                <input type="checkbox" name="is_primary" />
                                <span className="text-sm">Primary</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Alt Text</label>
                            <input type="text" name="alt_text" className="w-full border rounded px-2 py-1 text-sm" />
                          </div>
                          <button disabled={!!uploadingMap[r.id]} type="submit" className="w-full bg-gray-900 text-white rounded px-3 py-2 text-sm">
                            {uploadingMap[r.id] ? 'Uploading...' : 'Upload'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded border p-2">
          <div className="text-sm font-semibold mb-1">Stock by Color</div>
          <ul className="text-sm space-y-1">
            {colorTotals.length ? (
              colorTotals.map((ct) => (
                <li key={ct.id} className="flex justify-between">
                  <span>{getColorName(ct.id)}</span>
                  <span className="font-mono">{ct.total}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">—</li>
            )}
          </ul>
        </div>
        <div className="rounded border p-2">
          <div className="text-sm font-semibold mb-1">Stock by Size</div>
          <ul className="text-sm space-y-1">
            {sizeTotals.length ? (
              sizeTotals.map((st) => (
                <li key={st.id} className="flex justify-between">
                  <span>{getSizeName(st.id)}</span>
                  <span className="font-mono">{st.total}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">—</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
