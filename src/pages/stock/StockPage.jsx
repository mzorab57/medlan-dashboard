import { useEffect, useState, useRef, useMemo } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';
import { useAuth } from '../../store/auth';

export default function StockPage() {
  const { add } = useToast();
  const { user } = useAuth();
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  
  // Product Search States
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Selection States
  const [selectedProduct, setSelectedProduct] = useState(null); // { id, name }
  const [specOptions, setSpecOptions] = useState([]);
  const [specId, setSpecId] = useState('');
  
  // Filters
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [filterColorId, setFilterColorId] = useState('');
  const [filterSizeId, setFilterSizeId] = useState('');

  // Adjustment
  const [adjustQty, setAdjustQty] = useState('');
  const [desc, setDesc] = useState('');
  
  const specsReqId = useRef(0);

  // 1. Initial Load (Colors, Sizes, Restored State)
  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes] = await Promise.all([
            api.get('/api/colors'),
            api.get('/api/sizes')
        ]);
        setColors(cRes.data || cRes);
        setSizes(sRes.data || sRes);
      } catch { /* ignore */ }
    })();

    // Restore from LocalStorage
    const pid = localStorage.getItem('stock_product_id');
    const pname = localStorage.getItem('stock_product_name');
    const sid = localStorage.getItem('stock_spec_id');
    if (pid && pname) {
        setSelectedProduct({ id: pid, name: pname });
        setProductSearch(pname);
        fetchSpecs(pid, sid);
    }
  }, []);

  // 2. Search Logic
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!productSearch.trim()) {
        setProductResults([]);
        return;
      }
      setProductLoading(true);
      try {
        const res = await api.get(`/api/products?search=${productSearch}&per_page=5`);
        setProductResults(res.data || res);
      } catch { setProductResults([]); } 
      finally { setProductLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch]);

  // 3. Fetch Specs for a Product
  async function fetchSpecs(productId, preSelectedSpecId = null) {
    const rid = ++specsReqId.current;
    try {
      const res = await api.get(`/api/products/${productId}/specs`);
      if (rid !== specsReqId.current) return;
      
      const list = res.data?.data || res.data || res || [];
      setSpecOptions(list);

      // Auto Select Logic
      if (preSelectedSpecId) {
        setSpecId(preSelectedSpecId);
        fetchHistory(preSelectedSpecId);
      } else if (list.length === 1) {
        setSpecId(String(list[0].id));
        fetchHistory(String(list[0].id));
      } else {
        setSpecId('');
        setItems([]);
      }
    } catch {
      setSpecOptions([]);
    }
  }

  // 4. Fetch History
  async function fetchHistory(id) {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/stock?product_spec_id=${id}`);
      setItems(res.data || res);
      // Save state
      localStorage.setItem('stock_spec_id', id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // 5. Adjust Stock
  async function adjust(e) {
    e.preventDefault();
    if (!specId || !adjustQty) return;
    try {
      await api.post('/api/stock/adjust', { 
        product_spec_id: Number(specId), 
        quantity: Number(adjustQty), 
        description: desc 
      });
      setAdjustQty('');
      setDesc('');
      add('Stock adjusted successfully', 'success');
      fetchHistory(specId);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  // Helper to filter specs based on dropdowns
  const availableSpecs = useMemo(() => {
    return specOptions.filter(s => {
        if (filterColorId && String(s.color_id) !== filterColorId) return false;
        if (filterSizeId && String(s.size_id) !== filterSizeId) return false;
        return true;
    });
  }, [specOptions, filterColorId, filterSizeId]);

  // Handle Product Selection
  function handleSelectProduct(p) {
    setSelectedProduct({ id: p.id, name: p.name });
    setProductSearch(p.name);
    setDropdownOpen(false);
    setSpecId('');
    setFilterColorId('');
    setFilterSizeId('');
    setItems([]);
    
    localStorage.setItem('stock_product_id', p.id);
    localStorage.setItem('stock_product_name', p.name);
    localStorage.removeItem('stock_spec_id');
    
    fetchSpecs(p.id);
  }

  // Render Helpers
  const getColorName = (id) => colors.find(c => String(c.id) === String(id))?.name || '-';
  const getSizeName = (id) => sizes.find(s => String(s.id) === String(id))?.name || '-';
  
  const totalStock = useMemo(() => {
    return specOptions.reduce((sum, s) => sum + Number(s.stock ?? s.quantity_in_stock ?? 0), 0);
  }, [specOptions]);
  const colorTotals = useMemo(() => {
    const map = {};
    specOptions.forEach((s) => {
      const cid = s.color_id;
      if (!cid) return;
      const qty = Number(s.stock ?? s.quantity_in_stock ?? 0);
      map[cid] = (map[cid] || 0) + qty;
    });
    return Object.entries(map).map(([id, total]) => ({ id, total }));
  }, [specOptions]);
  const sizeTotals = useMemo(() => {
    const map = {};
    specOptions.forEach((s) => {
      const sid = s.size_id;
      if (!sid) return;
      const qty = Number(s.stock ?? s.quantity_in_stock ?? 0);
      map[sid] = (map[sid] || 0) + qty;
    });
    return Object.entries(map).map(([id, total]) => ({ id, total }));
  }, [specOptions]);

  const stockValueCost = useMemo(() => {
    return specOptions.reduce((sum, s) => {
      const qty = Number(s.stock ?? s.quantity_in_stock ?? 0);
      const cost = Number(s.purchase_price ?? 0);
      return sum + (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(cost) ? cost : 0);
    }, 0);
  }, [specOptions]);

  const stockValueSale = useMemo(() => {
    return specOptions.reduce((sum, s) => {
      const qty = Number(s.stock ?? s.quantity_in_stock ?? 0);
      const sale = Number(s.final_price ?? s.price ?? 0);
      return sum + (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(sale) ? sale : 0);
    }, 0);
  }, [specOptions]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Stock Management</h2>

      {/* SEARCH & FILTER SECTION */}
      <div className="rounded-xl border bg-white p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Product Search */}
            <div className="relative">
                <label className="text-xs text-gray-500 font-medium mb-1 block">Product</label>
                <input
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Search product..."
                    value={productSearch}
                    onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true); }}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                />
                {dropdownOpen && productResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-xl z-50 max-h-60 overflow-y-auto">
                        {productResults.map(p => (
                            <div key={p.id} 
                                 className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                                 onMouseDown={() => handleSelectProduct(p)}>
                                {p.name}
                            </div>
                        ))}
                    </div>
                )}
                {productLoading && <div className="absolute right-3 top-9 text-xs text-gray-400">Loading...</div>}
            </div>

           

            {/* 4. Exact Spec Selection */}
            <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Select Variant *</label>
                <select 
                    className={`w-full rounded-md border px-3 py-2 ${!specId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    value={specId}
                    onChange={(e) => {
                        const v = e.target.value;
                        setSpecId(v);
                        fetchHistory(v);
                    }}
                    disabled={!selectedProduct}
                >
                    <option value="">Select Variant...</option>
                    {availableSpecs.map(s => (
                        <option key={s.id} value={s.id}>
                           {getColorName(s.color_id)} / {getSizeName(s.size_id)} (Qty: {s.stock ?? s.quantity_in_stock ?? '?'})
                        </option>
                    ))}
                </select>
            </div>
        </div>
        {selectedProduct && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
            <div className="rounded-md border p-3">
              <div className="text-xs text-gray-500">Total Stock</div>
              <div className="text-xl font-semibold text-blue-600">{totalStock}</div>
              <div className="text-xs text-gray-500 mt-1">Product: {selectedProduct?.name}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-gray-500">Stock Value (Cost)</div>
              <div className="text-xl font-semibold text-emerald-700">{stockValueCost.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 mt-1">IQD</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-gray-500">Stock Value (Sale)</div>
              <div className="text-xl font-semibold text-emerald-700">{stockValueSale.toLocaleString()}</div>
              <div className="text-[11px] text-gray-500 mt-1">IQD</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-gray-500 mb-2">By Color</div>
              <ul className="text-sm space-y-1">
                {colorTotals.length ? colorTotals.map((ct) => (
                  <li key={ct.id} className="flex justify-between">
                    <span>{getColorName(ct.id)}</span>
                    <span className="font-mono">{ct.total}</span>
                  </li>
                )) : <li className="text-gray-400">—</li>}
              </ul>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs text-gray-500 mb-2">By Size</div>
              <ul className="text-sm space-y-1">
                {sizeTotals.length ? sizeTotals.map((st) => (
                  <li key={st.id} className="flex justify-between">
                    <span>{getSizeName(st.id)}</span>
                    <span className="font-mono">{st.total}</span>
                  </li>
                )) : <li className="text-gray-400">—</li>}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ADJUSTMENT SECTION */}
      {specId && user?.role === 'admin' && (
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Adjust Stock for: <span className="text-blue-600">{selectedProduct?.name}</span></h3>
            <form onSubmit={adjust} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-gray-500 mb-1 block">Quantity (+ Add / - Remove)</label>
                    <input 
                        type="number" 
                        className="w-full rounded-md border px-3 py-2" 
                        placeholder="+10 or -5" 
                        value={adjustQty} 
                        onChange={e => setAdjustQty(e.target.value)} 
                        required
                    />
                </div>
                <div className="flex-[2] w-full">
                    <label className="text-xs text-gray-500 mb-1 block">Reason / Description</label>
                    <input 
                        className="w-full rounded-md border px-3 py-2" 
                        placeholder="e.g. Broken item, New shipment..." 
                        value={desc} 
                        onChange={e => setDesc(e.target.value)} 
                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition w-full sm:w-auto font-medium">
                    Update Stock
                </button>
            </form>
          </div>
      )}

      {/* HISTORY TABLE */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Stock History</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading history...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No history found for this variant.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                <tr>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Order ID</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                </tr>
                </thead>
                <tbody className="divide-y">
                {items.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                                m.type === 'manual_add' ? 'bg-green-100 text-green-700' :
                                m.type === 'manual_remove' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {m.type}
                            </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                            {Number(m.quantity) > 0 ? '+' : ''}{m.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{m.description || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{m.order_item_id ? `#${m.order_item_id}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(m.created_at).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
