import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { downloadCSV } from '../../lib/csv';
import { useToast } from '../../store/toast';
import { STATUSES, normalizeStatus, canTransition, isLocked, statusBgClass } from '../../lib/status';
import { useAuth } from '../../store/auth';

const SOURCES = ['', 'website', 'whatsapp', 'instagram'];
const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;
function assetUrl(p) {
  const raw = String(p || '').trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || /^data:/i.test(raw)) return raw;
  const rel = raw.replace(/^\/+/, '');
  return `${ASSET_BASE}/${rel}`;
}

 
const DELIVERY_FREE_THRESHOLD = 35000;

function stripMetaFromAddress(address) {
  return String(address || '').replace(/\s*\[medlan:[a-z_]+=[^\]]+\]\s*/gi, ' ').replace(/\s+/g, ' ').trim();
}

function toNum(v) {
  const s = String(v ?? '').replace(/,/g, '').trim();
  const n = s === '' ? 0 : Number(s);
  return Number.isFinite(n) ? n : 0;
}

export default function OrdersPage() {
  const { add } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // --- List State ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  // --- Filters ---
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState(''); // Added select for source
  
  // --- View State ---
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [updateStatusMap, setUpdateStatusMap] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [discountDraft, setDiscountDraft] = useState('');
  const [discountSaving, setDiscountSaving] = useState(false);
  const [pendingDiscountByOrderId, setPendingDiscountByOrderId] = useState({});
  const [itemPriceDraftById, setItemPriceDraftById] = useState({});
  const [itemPriceSavingById, setItemPriceSavingById] = useState({});
  const [editSpecSearch, setEditSpecSearch] = useState('');
  const [editSpecResults, setEditSpecResults] = useState([]);
  const [editIsSearching, setEditIsSearching] = useState(false);
  const [editSelectedProduct, setEditSelectedProduct] = useState(null);
  const [editAddQty, setEditAddQty] = useState(1);
  const [editAddLoading, setEditAddLoading] = useState(false);

  // --- Create State ---
  const [createOpen, setCreateOpen] = useState(false);
  const [createData, setCreateData] = useState({
    customer_name: '',
    phone_number: '',
    address: '',
    order_source: 'whatsapp',
    items: [],
    delivery_city_id: '',
    delivery_paid_by: 'medlan'
  });
  
  // --- Search & Specs State ---
  const [specSearch, setSpecSearch] = useState('');
  const [specResults, setSpecResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // { id, name, specs: [] }
  
  // --- Stats State ---
  const [summary, setSummary] = useState({ website: 0, whatsapp: 0, instagram: 0, other: 0, total: 0 });
  const [deliverySettingsOpen, setDeliverySettingsOpen] = useState(false);
  const [deliveryCities, setDeliveryCities] = useState([]);
  const [deliveryCitiesLoading, setDeliveryCitiesLoading] = useState(false);
  const [deliveryCitiesApiMissing, setDeliveryCitiesApiMissing] = useState(false);
  const [newCity, setNewCity] = useState({ city_key: '', name: '', fee: '', is_active: 1 });

  // 1. Fetch Orders List
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: '20',
        ...(statusFilter && { status: statusFilter }),
        ...(sourceFilter && { source: sourceFilter })
      });
      const res = await api.get(`/api/orders?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, sourceFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const fetchDeliveryCities = useCallback(async () => {
    setDeliveryCitiesLoading(true);
    try {
      const res = await api.get('/api/delivery-cities');
      const list = res?.data || res || [];
      setDeliveryCities(Array.isArray(list) ? list : []);
      setDeliveryCitiesApiMissing(false);
    } catch (e) {
      if (e?.status === 404) {
        setDeliveryCitiesApiMissing(true);
        add('Endpoint /api/delivery-cities not found. Update backend routes/controller.', 'error');
      } else {
        add(e.message, 'error');
      }
      setDeliveryCities([]);
    } finally {
      setDeliveryCitiesLoading(false);
    }
  }, [add]);

  useEffect(() => {
    fetchDeliveryCities();
  }, [fetchDeliveryCities]);

  // 2. Optimized Summary Fetcher (Better to move to Backend)
  // This still fetches pages but we keep it separated to not block UI
  useEffect(() => {
    let mounted = true;
    (async () => {
        try {
            // Note: Best practice is to have GET /api/orders/stats endpoint
            // Currently keeping frontend logic but optimized to run once per filter change
            const counts = { website: 0, whatsapp: 0, instagram: 0, other: 0, total: 0 };
            let p = 1;
            // Limit to 5 pages max to prevent freezing if there are 1000s of orders
            // OR ask backend to implement stats endpoint
            while (p <= 5) { 
                const res = await api.get(`/api/orders?page=${p}&per_page=100${statusFilter ? `&status=${statusFilter}` : ''}`);
                const list = res.data || res;
                if (!Array.isArray(list) || list.length === 0) break;
                
                list.forEach(o => {
                    const s = normalizeSource(o.order_source);
                    if (s === 'web') counts.website++;
                    else if (s === 'wa') counts.whatsapp++;
                    else if (s === 'insta') counts.instagram++;
                    else counts.other++;
                });
                counts.total += list.length;
                if (list.length < 100) break;
                p++;
            }
            if (mounted) setSummary(counts);
        } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [statusFilter]);

  // 3. View Order Logic (Optimized)
  async function fetchView(id) {
    setViewLoading(true);
    try {
      const res = await api.get(`/api/orders?id=${id}`);
      let orderData = res && typeof res === 'object' ? { ...res } : res;
      let orderItems = Array.isArray(orderData?.items) ? [...orderData.items] : [];

      // Optimization: Instead of looping ALL products, only fetch specific products referenced in items
      const uniqueProductIds = [...new Set(orderItems.map(it => it.product_id).filter(Boolean))];
      const uniqueSpecIds = [...new Set(orderItems.map(it => it.product_spec_id).filter(Boolean))];
      
      // Fetch details only for relevant products in parallel
      const productDetails = await Promise.all(
          uniqueProductIds.map(pid => api.get(`/api/products/${pid}/specs`).catch(() => null))
      );

      // Create a map for fast lookup: ProductID -> Specs Array
      const specsMap = {}; 
      uniqueProductIds.forEach((pid, index) => {
          const specs = productDetails[index];
          if (specs) specsMap[pid] = Array.isArray(specs) ? specs : (specs.data || []);
      });

      // Also fetch product names
      const productInfos = await Promise.all(
          uniqueProductIds.map(pid => api.get(`/api/products?id=${pid}`).catch(() => null))
      );
      const productNameMap = {};
      uniqueProductIds.forEach((pid, index) => {
          const info = productInfos[index];
          if (info) {
              const p = (Array.isArray(info) ? info[0] : (info.product || info));
              if (p && p.name) productNameMap[pid] = p.name;
          }
      });

      const specImages = await Promise.all(
        uniqueSpecIds.map(sid => api.get(`/api/specs/${sid}/images`).catch(() => null))
      );
      const specImageMap = {};
      uniqueSpecIds.forEach((sid, index) => {
        const r = specImages[index];
        const list = r ? (r.data || r) : [];
        const arr = Array.isArray(list) ? list : [];
        const primary = arr.find(x => Number(x.is_primary) === 1) || arr[0];
        if (primary) {
          const img = primary.image || primary.path || primary.url || primary.image_url;
          if (img) specImageMap[sid] = img;
        }
      });

      // Enrich items
      orderItems = orderItems.map(it => {
          const pid = it.product_id;
          const sid = it.product_spec_id;
          
          // Try to find missing info from our fetched specs
          if (pid && specsMap[pid]) {
              const matchedSpec = specsMap[pid].find(s => Number(s.id) === Number(sid));
              if (matchedSpec) {
                  const currentFinal = matchedSpec.final_price != null ? Number(matchedSpec.final_price) : null;
                  const currentBase = matchedSpec.price != null ? Number(matchedSpec.price) : null;
                  const currentPurchase = matchedSpec.purchase_price != null ? Number(matchedSpec.purchase_price) : null;
                  return {
                      ...it,
                      product_name: it.product_name || productNameMap[pid] || it.product_name,
                      size_name: it.size_name || matchedSpec.size_name || matchedSpec.size,
                      color_name: it.color_name || matchedSpec.color_name || matchedSpec.color,
                      variant_image: it.variant_image || specImageMap[sid] || matchedSpec.image || matchedSpec.primary_image,
                      variant_current_price: Number.isFinite(currentFinal) ? currentFinal : (Number.isFinite(currentBase) ? currentBase : undefined),
                      variant_purchase_price: Number.isFinite(currentPurchase) ? currentPurchase : undefined,
                      // assuming product name might be in the parent object in your API, otherwise fetch product details
                  };
              }
          }
          return { ...it, product_name: it.product_name || productNameMap[pid] || it.product_name, variant_image: it.variant_image || specImageMap[sid] };
      });

      setViewData({ ...orderData, items: orderItems });
      setItemPriceDraftById((prev) => {
        const base = prev && typeof prev === 'object' ? { ...prev } : {};
        orderItems.forEach((it) => {
          const idNum = Number(it.id);
          if (!Number.isFinite(idNum)) return;
          if (base[idNum] == null) base[idNum] = String(it.price ?? '');
        });
        return base;
      });
      const oid = Number(id);
      const queued = pendingDiscountByOrderId?.[oid];
      const od = orderData?.order?.order_discount ?? orderData?.order?.discount ?? 0;
      setDiscountDraft(String(queued != null ? queued : (od ?? '')));
    } catch (e) {
      setError(e.message);
    } finally {
      setViewLoading(false);
    }
  }

  // 4. Create Order: Product Search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!specSearch.trim()) {
        setSpecResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${specSearch}&per_page=5`);
        setSpecResults(res.data || res || []);
      } catch { setSpecResults([]); } 
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [specSearch]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!editSpecSearch.trim()) {
        setEditSpecResults([]);
        return;
      }
      setEditIsSearching(true);
      try {
        const res = await api.get(`/api/products?search=${editSpecSearch}&per_page=5`);
        setEditSpecResults(res.data || res || []);
      } catch { setEditSpecResults([]); }
      finally { setEditIsSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [editSpecSearch]);

  async function selectProductForCreate(prod) {
      try {
          const res = await api.get(`/api/products/${prod.id}/specs`);
          const specs = Array.isArray(res) ? res : (res.data || []);
          setSelectedProduct({ ...prod, specs });
          setSpecSearch(prod.name); // Set input to name
          setSpecResults([]); // Hide dropdown
      } catch {
          add('Failed to load product specs', 'error');
      }
  }

  async function selectProductForEdit(prod) {
      try {
          const res = await api.get(`/api/products/${prod.id}/specs`);
          const specs = Array.isArray(res) ? res : (res.data || []);
          setEditSelectedProduct({ ...prod, specs });
          setEditSpecSearch(prod.name);
          setEditSpecResults([]);
      } catch {
          add('Failed to load product specs', 'error');
      }
  }

  // 5. Actions
  function normalizeSource(src) {
    const s = String(src || '').toLowerCase().trim();
    if (s.includes('insta')) return 'insta';
    if (s.includes('whats') || s === 'wa') return 'wa';
    if (s.includes('web')) return 'web';
    return 'other';
  }

  function displaySource(src) {
      const n = normalizeSource(src);
      if (n === 'insta') return 'Instagram';
      if (n === 'wa') return 'WhatsApp';
      if (n === 'web') return 'Website';
      return src || '-';
  }

  async function changeStatus(id, newStatus) {
      if(!newStatus) return;
      // Optimistic UI update or simple reload
      try {
          const oid = Number(id);
          const normalized = normalizeStatus(newStatus);
          const queued = pendingDiscountByOrderId?.[oid];
          const payload = { status: newStatus };
          if (normalized === 'completed' && queued != null) {
              setDiscountSaving(true);
              payload.order_discount = Number(queued || 0);
          }
          await api.patch(`/api/orders/status?id=${id}`, payload);
          add('Status updated', 'success');
          setUpdateStatusMap(prev => ({ ...prev, [id]: newStatus }));
          if (normalized === 'completed') {
            setPendingDiscountByOrderId((s) => {
              const next = { ...(s || {}) };
              delete next[oid];
              return next;
            });
          }
          fetchList(); // Refresh list to be sure
      } catch(e) {
          add(e.message, 'error');
      } finally {
          setDiscountSaving(false);
      }
  }

  async function applyDiscount(orderId, discountAmount) {
    const oid = Number(orderId);
    const amt = Number(discountAmount || 0);
    if (!Number.isFinite(amt) || amt < 0) {
      add('Invalid discount', 'error');
      return;
    }
    setPendingDiscountByOrderId((s) => {
      const next = { ...(s || {}) };
      if (amt > 0) next[oid] = amt;
      else delete next[oid];
      return next;
    });
    add('Discount queued (will apply on completed)', 'success');
  }

  async function addItemToOrder(spec, qty = 1) {
    if (!viewId) return;
    setEditAddLoading(true);
    try {
      await api.post(`/api/orders/items?id=${viewId}`, { product_spec_id: Number(spec.id), quantity: Number(qty || 1) });
      add('Item added', 'success');
      setEditSelectedProduct(null);
      setEditSpecSearch('');
      setEditSpecResults([]);
      setEditAddQty(1);
      fetchView(viewId);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setEditAddLoading(false);
    }
  }

  async function deleteItemFromOrder(orderItemId) {
    if (!viewId) return;
    
    try {
      await api.del(`/api/orders/items?id=${orderItemId}`);
      add('Item removed', 'success');
      fetchView(viewId);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  // Create Order Logic
  function addToCart(spec, productName) {
      setCreateData(prev => {
          const existing = prev.items.find(i => i.product_spec_id === spec.id);
          if (existing) {
              if (spec.stock != null && existing.quantity >= spec.stock) {
                  add('Max stock reached', 'error');
                  return prev;
              }
              return {
                  ...prev,
                  items: prev.items.map(i => i.product_spec_id === spec.id ? { ...i, quantity: i.quantity + 1 } : i)
              };
          }
          const promoPrice = toNum(spec.final_price || spec.price);
          const basePrice = toNum(spec.price);
          const purchasePrice = spec.purchase_price == null ? null : toNum(spec.purchase_price);
          return {
              ...prev,
              items: [...prev.items, {
                  product_spec_id: spec.id,
                  product_name: productName,
                  color_name: spec.color_name || spec.color_id,
                  size_name: spec.size_name || spec.size_id,
                  price: promoPrice,
                  promo_price: promoPrice,
                  base_price: basePrice,
                  purchase_price: purchasePrice,
                  promo_discount_amount: toNum(spec.discount_amount || 0),
                  quantity: 1,
                  stock: spec.stock
              }]
          };
      });
  }

  async function submitOrder(e) {
      e.preventDefault();
      try {
          const cartTotal = createData.items.reduce((sum, it) => sum + toNum(it.price) * toNum(it.quantity), 0);
          const isWebsite = String(createData.order_source || '').toLowerCase() === 'website';
          const canToggle = !isWebsite && cartTotal >= DELIVERY_FREE_THRESHOLD;
          const paidBy = cartTotal < DELIVERY_FREE_THRESHOLD ? 'client' : (canToggle ? createData.delivery_paid_by : 'medlan');
          const cityId = createData.delivery_city_id ? Number(createData.delivery_city_id) : null;
          if (paidBy === 'medlan' && !cityId) {
              add('Select delivery city', 'error');
              return;
          }
          for (const it of createData.items) {
              const unitPrice = toNum(it.price);
              const pp = it.purchase_price == null ? null : toNum(it.purchase_price);
              if (pp != null && pp > 0 && unitPrice < pp) {
                  add(`Price for ${it.product_name} cannot be below purchase price`, 'error');
                  return;
              }
              const promo = toNum(it.promo_price ?? it.base_price ?? it.price);
              if (unitPrice > promo) {
                  add(`Price for ${it.product_name} cannot be above promo price`, 'error');
                  return;
              }
          }
          const payload = {
              customer_name: createData.customer_name,
              phone_number: createData.phone_number,
              address: stripMetaFromAddress(createData.address),
              order_source: normalizeSource(createData.order_source),
              items: createData.items.map(i => ({
                product_spec_id: i.product_spec_id,
                quantity: i.quantity,
                unit_price: (toNum(i.price) !== toNum(i.promo_price)) ? toNum(i.price) : undefined,
              })),
              delivery_city_id: cityId || undefined,
              delivery_paid_by: canToggle ? paidBy : undefined,
          };
          await api.post('/api/orders', payload);
          add('Order created successfully', 'success');
          setCreateOpen(false);
          setCreateData({
            customer_name: '',
            phone_number: '',
            address: '',
            order_source: 'whatsapp',
            items: [],
            delivery_city_id: '',
            delivery_paid_by: 'medlan',
          });
          fetchList();
      } catch(e) {
          add(e.message, 'error');
      }
  }

  async function createDeliveryCity() {
    if (deliveryCitiesApiMissing) {
      add('Backend not updated: /api/delivery-cities missing', 'error');
      return;
    }
    try {
      const payload = {
        city_key: String(newCity.city_key || '').trim(),
        name: String(newCity.name || '').trim(),
        fee: Number(newCity.fee || 0),
        is_active: Number(newCity.is_active),
      };
      if (!payload.city_key || !payload.name) { add('city_key and name required', 'error'); return; }
      await api.post('/api/delivery-cities', payload);
      add('City created', 'success');
      setNewCity({ city_key: '', name: '', fee: '', is_active: 1 });
      fetchDeliveryCities();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function updateDeliveryCity(id, patch) {
    if (deliveryCitiesApiMissing) {
      add('Backend not updated: /api/delivery-cities missing', 'error');
      return;
    }
    try {
      await api.patch(`/api/delivery-cities?id=${id}`, patch);
      add('City updated', 'success');
      fetchDeliveryCities();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function deleteDeliveryCity(id) {
    if (deliveryCitiesApiMissing) {
      add('Backend not updated: /api/delivery-cities missing', 'error');
      return;
    }
    try {
      await api.del(`/api/delivery-cities?id=${id}`);
      add('City deleted', 'success');
      fetchDeliveryCities();
    } catch (e) {
      add(e.message, 'error');
    }
  }
  
  // CSV Export
  async function handleExport() {
      // Use existing logic but maybe show loading state
      try {
          add('Preparing CSV...', 'info');
          // ... (Existing CSV Logic)
          const rows = [];
          let p = 1;
          while(true) {
             const res = await api.get(`/api/orders?page=${p}&per_page=100${statusFilter ? `&status=${statusFilter}` : ''}`);
             const chunk = res.data || res;
             if(!chunk.length) break;
             rows.push(...chunk);
             if(chunk.length < 100) break;
             p++;
          }
          downloadCSV('orders.csv', rows, [
              { header: 'ID', key: 'id' }, { header: 'Customer', key: 'customer_name' },
              { header: 'Total', key: 'total_price' }, { header: 'Status', key: 'status' }
          ]);
      } catch(e) { add(e.message, 'error'); }
  }


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex  items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setDeliverySettingsOpen(true)} className="w-fit sm:w-auto rounded-md border bg-white px-4 py-2 hover:bg-gray-50 shadow-sm">
            Delivery Settings
          </button>
          <button onClick={() => setCreateOpen(true)} className="w-fit sm:w-auto rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 shadow-sm">
            + Create Order
          </button>
        </div>
      </div>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* SUMMARY CARDS (Compact) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(summary).map(([key, val]) => (
              <div key={key} className="bg-white border rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold">{key}</div>
                  <div className="text-xl font-semibold mt-1">{val}</div>
              </div>
          ))}
      </div>

      {/* FILTERS & ACTIONS */}
      <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-3 w-full md:w-auto">
              <select className="rounded-md border px-3 py-2 bg-gray-50 text-sm w-full md:w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All Statuses</option>
                  {STATUSES.filter(s => !['processing', 'returned'].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="rounded-md border px-3 py-2 bg-gray-50 text-sm w-full md:w-40" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}>
                  <option value="">All Sources</option>
                  {SOURCES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
          </div>
          <button onClick={handleExport} className="text-sm border px-3 py-2 rounded hover:bg-gray-50 w-full md:w-auto">
             Export CSV
          </button>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">#ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((o) => (
                  <tr key={o.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => { setViewId(o.id); fetchView(o.id); }}>
                    <td className="px-4 py-3 font-medium text-gray-600">#{o.id}</td>
                    <td className="px-4 py-3">
                        <div className="font-medium">{o.customer_name}</div>
                        <div className="text-xs text-gray-500">{o.phone_number}</div>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded border ${
                            normalizeSource(o.order_source) === 'wa' ? 'bg-green-50 text-green-700 border-green-200' :
                            normalizeSource(o.order_source) === 'insta' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                            {displaySource(o.order_source)}
                        </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{Number(o.total_price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusBgClass(o.status)}`}>
                            {o.status}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {!isLocked(o.status) && (
                            <select 
                                className="text-xs border rounded p-1 bg-white"
                                value={updateStatusMap[o.id] ?? normalizeStatus(o.status)}
                                onChange={(e) => changeStatus(o.id, e.target.value)}
                            >
                                {STATUSES.map(s => (
                                    <option key={s} value={s} disabled={!canTransition(o.status, s)}>{s}</option>
                                ))}
                            </select>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="p-3 border-t flex justify-between items-center bg-gray-50">
            <button disabled={page<=1} onClick={() => setPage(p => p-1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50">Prev</button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded bg-white">Next</button>
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{marginTop:'0px'}}>
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold">Order Details #{viewId}</h3>
                <button onClick={() => setViewId(null)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                {viewLoading || !viewData ? (
                    <div className="text-center py-10">Loading details...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-gray-50 rounded border">
                                <div className="text-gray-500 text-xs uppercase">Customer</div>
                                <div className="font-semibold">{viewData.order?.customer_name}</div>
                                <div>{viewData.order?.phone_number}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded border">
                                <div className="text-gray-500 text-xs uppercase">Shipping</div>
                                <div>{stripMetaFromAddress(viewData.order?.address) || 'No address provided'}</div>
                                <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs ${statusBgClass(viewData.order?.status)}`}>{viewData.order?.status}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                          {(() => {
                            const o = viewData.order || {};
                            const cityId = o.delivery_city_id != null ? Number(o.delivery_city_id) : null;
                            const address = String(o.address || '').toLowerCase();
                            const byId = cityId ? deliveryCities.find(c => Number(c.id) === cityId) : null;
                            const inferred = deliveryCities.find(c => address.includes(String(c.city_key || '').toLowerCase()) || address.includes(String(c.name || '').toLowerCase()));
                            const cityName = o.delivery_city_name || byId?.name || inferred?.name || '';
                            const paidBy = String(o.delivery_paid_by || '').toLowerCase() || (Number(o.total_price || 0) >= DELIVERY_FREE_THRESHOLD ? 'medlan' : 'client');
                            const fee = o.delivery_fee != null ? Number(o.delivery_fee) : null;
                            const paidLabel = paidBy === 'medlan' ? 'Free (Medlan)' : 'Customer pays';
                            const feeLabel = paidBy === 'medlan' ? (fee ? fee.toLocaleString() : '—') : '—';
                            return (
                              <>
                                <div className="p-3 bg-gray-50 rounded border">
                                  <div className="text-gray-500 text-xs uppercase">City</div>
                                  <div className="font-semibold">{cityName || '—'}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded border">
                                  <div className="text-gray-500 text-xs uppercase">Delivery</div>
                                  <div className="font-semibold">{paidLabel}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded border">
                                  <div className="text-gray-500 text-xs uppercase">Delivery Fee</div>
                                  <div className="font-semibold">{feeLabel}</div>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {(() => {
                          const o = viewData.order || {};
                          const st = normalizeStatus(o.status);
                          const editable = ['pending', 'processing', 'shipped'].includes(st);
                          const list = Array.isArray(viewData.items) ? viewData.items : [];
                          const subtotal = list.reduce((sum, it) => sum + toNum(it.price) * toNum(it.quantity), 0);
                          const costTotal = list.reduce((sum, it) => sum + toNum(it.cost) * toNum(it.quantity), 0);
                          const grossProfit = subtotal - costTotal;
                          const maxDiscount = Math.max(0, grossProfit);
                          const currentDiscount = toNum(o.order_discount || 0);
                          const oid = Number(o.id || viewId);
                          const queuedDiscount = pendingDiscountByOrderId?.[oid];
                          const effectiveDiscount = Number(queuedDiscount != null ? queuedDiscount : currentDiscount);
                          const draft = toNum(discountDraft || 0);
                          const invalid = !Number.isFinite(draft) || draft < 0 || draft > maxDiscount;
                          const netProfit = grossProfit - effectiveDiscount;
                          return (
                            <>
                              <div className="rounded-xl border bg-white p-4">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                                  <div>
                                    <div className="text-xs font-bold text-gray-600 uppercase">Discount</div>
                                    <div className="text-sm text-gray-600">
                                      Max: {maxDiscount.toLocaleString()}
                                      {isAdmin ? ` • Gross profit: ${grossProfit.toLocaleString()} • Net profit: ${netProfit.toLocaleString()}` : ''}
                                      {queuedDiscount != null && editable ? ` • Queued: ${Number(queuedDiscount).toLocaleString()}` : ''}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      className={`w-40 rounded border px-3 py-2 text-sm ${invalid ? 'border-red-300' : ''}`}
                                      type="number"
                                      step="1"
                                      value={discountDraft}
                                      onChange={(e) => setDiscountDraft(e.target.value)}
                                      disabled={!editable || discountSaving}
                                      placeholder="Discount"
                                    />
                                    <button
                                      type="button"
                                      className="px-4 py-2 rounded bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
                                      disabled={!editable || discountSaving || invalid}
                                      onClick={() => applyDiscount(viewId, draft)}
                                    >
                                      Queue
                                    </button>
                                    <button
                                      type="button"
                                      className="px-4 py-2 rounded border text-sm hover:bg-gray-50 disabled:opacity-50"
                                      disabled={!editable || discountSaving || (currentDiscount === 0 && queuedDiscount == null)}
                                      onClick={() => { setDiscountDraft('0'); applyDiscount(viewId, 0); }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                                {editable ? (
                                  <div className="mt-2 text-xs text-gray-500">Discount will be sent to backend only when status becomes completed.</div>
                                ) : null}
                                {invalid ? (
                                  <div className="mt-2 text-xs text-red-600">Discount must be between 0 and {maxDiscount.toLocaleString()}.</div>
                                ) : null}
                              </div>

                              <table className="w-full text-sm border-collapse">
                                <thead>
                                  <tr className="border-b text-gray-500 text-xs uppercase">
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-center py-2">Qty</th>
                                    <th className="text-right py-2">Price</th>
                                    <th className="text-right py-2">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {list.map((it, idx) => (
                                    <tr key={idx}>
                                      <td className="py-3">
                                        <div className="flex items-center gap-3">
                                          <button
                                            type="button"
                                            className="relative h-10 w-10 rounded border bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer"
                                            onClick={() => {
                                              if (!it.variant_image) return;
                                              setImagePreview(assetUrl(it.variant_image));
                                            }}
                                            aria-label="Preview item image"
                                          >
                                            <span className="text-[10px] text-gray-400">N/A</span>
                                            {it.variant_image ? (
                                              <img src={assetUrl(it.variant_image)} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            ) : null}
                                          </button>
                                          <div>
                                            <div className="font-medium">{it.product_name || `Product #${it.product_id}`}</div>
                                            <div className="text-xs text-gray-500">
                                              {it.color_name} {it.size_name && `• ${it.size_name}`}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="text-center py-3">{it.quantity}</td>
                                      <td className="text-right py-3">
                                        {editable ? (
                                          <div className="flex items-center justify-end gap-2">
                                            <input
                                              className="w-28 border rounded px-2 py-1 text-right"
                                              type="number"
                                              step="1"
                                              value={itemPriceDraftById[it.id] ?? String(it.price ?? '')}
                                              min={toNum(it.variant_purchase_price ?? 0)}
                                              max={toNum(it.variant_current_price ?? it.price ?? 0)}
                                              onChange={(e) => {
                                                const v = e.target.value;
                                                setItemPriceDraftById((s) => ({ ...(s || {}), [it.id]: v }));
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className="text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
                                              disabled={itemPriceSavingById[it.id]}
                                              onClick={async () => {
                                                const draft = toNum(itemPriceDraftById[it.id] ?? it.price);
                                                const minP = toNum(it.variant_purchase_price ?? 0);
                                                const maxP = toNum(it.variant_current_price ?? it.price ?? 0);
                                                if (draft < minP) { add(`Price cannot be below purchase (${minP.toLocaleString()})`, 'error'); return; }
                                                if (draft > maxP) { add(`Price cannot exceed variant price (${maxP.toLocaleString()})`, 'error'); return; }
                                                setItemPriceSavingById((s) => ({ ...(s || {}), [it.id]: true }));
                                                try {
                                                  await api.patch(`/api/orders/items?id=${it.id}`, { unit_price: draft });
                                                  add('Item price updated', 'success');
                                                  fetchView(viewId);
                                                  fetchList();
                                                } catch (e) {
                                                  add(e.message, 'error');
                                                } finally {
                                                  setItemPriceSavingById((s) => ({ ...(s || {}), [it.id]: false }));
                                                }
                                              }}
                                            >
                                              Save
                                            </button>
                                            <button
                                              type="button"
                                              className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50 disabled:opacity-50"
                                              disabled={itemPriceSavingById[it.id]}
                                              onClick={() => deleteItemFromOrder(it.id)}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        ) : (
                                          Number(it.price).toLocaleString()
                                        )}
                                      </td>
                                      <td className="text-right py-3 font-medium">{(Number(it.quantity || 0) * Number(it.price || 0)).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="border-t">
                                  <tr>
                                    <td colSpan="3" className="text-right py-2 font-bold text-gray-600">Subtotal</td>
                                    <td className="text-right py-2 font-bold">{subtotal.toLocaleString()}</td>
                                  </tr>
                                  <tr>
                                    <td colSpan="3" className="text-right py-2 font-bold text-gray-600">Order Discount</td>
                                    <td className="text-right py-2 font-bold">{currentDiscount ? `-${currentDiscount.toLocaleString()}` : '0'}</td>
                                  </tr>
                                  {queuedDiscount != null && editable ? (
                                    <tr>
                                      <td colSpan="3" className="text-right py-2 font-bold text-gray-600">Queued Discount</td>
                                      <td className="text-right py-2 font-bold">{`-${Number(queuedDiscount).toLocaleString()}`}</td>
                                    </tr>
                                  ) : null}
                                  <tr>
                                    <td colSpan="3" className="text-right py-3 font-bold text-gray-600">Total</td>
                                    <td className="text-right py-3 font-bold text-lg">{toNum(o.total_price || (subtotal - currentDiscount) || 0).toLocaleString()}</td>
                                  </tr>
                                  {queuedDiscount != null && editable ? (
                                    <tr>
                                      <td colSpan="3" className="text-right py-3 font-bold text-gray-600">Preview Total (After Completed)</td>
                                      <td className="text-right py-3 font-bold text-lg">{Math.max(0, (subtotal - toNum(queuedDiscount || 0))).toLocaleString()}</td>
                                    </tr>
                                  ) : null}
                                </tfoot>
                              </table>

                              {editable ? (
                                <div className="mt-4 rounded-xl border bg-white p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                      <div className="text-xs font-bold text-gray-600 uppercase">Add Item</div>
                                      <div className="text-xs text-gray-500">Search product, pick variant, then add to this order.</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-xs text-gray-500">Qty</div>
                                      <input
                                        className="w-20 border rounded px-2 py-1 text-right"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={editAddQty}
                                        onChange={(e) => setEditAddQty(Math.max(1, toNum(e.target.value)))}
                                        disabled={editAddLoading}
                                      />
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    {!editSelectedProduct ? (
                                      <>
                                        <input
                                          className="w-full rounded border px-3 py-2 text-sm"
                                          placeholder="Search products..."
                                          value={editSpecSearch}
                                          onChange={(e) => setEditSpecSearch(e.target.value)}
                                          disabled={editAddLoading}
                                        />
                                        <div className="mt-2 space-y-2">
                                          {editIsSearching ? <div className="text-xs text-gray-500">Searching...</div> : null}
                                          {editSpecResults.map((p) => (
                                            <button
                                              key={p.id}
                                              type="button"
                                              className="w-full text-left p-2 border rounded hover:bg-blue-50"
                                              onClick={() => selectProductForEdit(p)}
                                              disabled={editAddLoading}
                                            >
                                              <div className="font-medium text-sm">{p.name}</div>
                                              <div className="text-xs text-gray-500">Select variants</div>
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    ) : (
                                      <div>
                                        <button
                                          type="button"
                                          className="text-xs text-gray-500 mb-2 hover:text-gray-800"
                                          onClick={() => { setEditSelectedProduct(null); setEditSpecSearch(''); setEditSpecResults([]); }}
                                          disabled={editAddLoading}
                                        >
                                          &larr; Back to search
                                        </button>
                                        <div className="font-bold text-sm mb-2">{editSelectedProduct.name}</div>
                                        <div className="space-y-2">
                                          {(editSelectedProduct.specs || []).map((sp) => (
                                            <div key={sp.id} className="flex items-center justify-between p-2 border rounded">
                                              <div>
                                                <div className="text-xs font-semibold">
                                                  {sp.color_name || sp.color_id} {sp.size_name ? `• ${sp.size_name}` : ''}
                                                </div>
                                                <div className="text-[11px] text-gray-500">
                                                  Stock: {sp.stock} • Price: {toNum(sp.final_price || sp.price).toLocaleString()}
                                                </div>
                                              </div>
                                              <button
                                                type="button"
                                                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                                disabled={editAddLoading || Number(sp.stock) < 1}
                                                onClick={() => addItemToOrder(sp, editAddQty)}
                                              >
                                                Add
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </>
                          );
                        })()}
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
      {imagePreview ? (
        <div className="fixed inset-0 z-[60] bg-black/70 p-4 flex items-center justify-center" style={{marginTop:'0px'}} onMouseDown={() => setImagePreview('')}>
          <div className="relative w-full max-w-4xl max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-gray-600 shadow flex items-center justify-center"
              onClick={() => setImagePreview('')}
              aria-label="Close image preview"
            >
              &times;
            </button>
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <img src={imagePreview} alt="" className="w-full h-full max-h-[90vh] object-contain bg-black" />
            </div>
          </div>
        </div>
      ) : null}

      {/* CREATE ORDER MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{marginTop:'0px'}}>
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold">New Order</h3>
                <button onClick={() => setCreateOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* LEFT: Customer Form & Cart */}
                <div className="w-full md:w-1/3 border-r p-6 overflow-y-auto bg-gray-50">
                    <h4 className="font-bold text-sm mb-3">Customer Details</h4>
                    <form id="createOrderForm" onSubmit={submitOrder} className="space-y-3">
                        <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Name *"  value={createData.customer_name} onChange={e => setCreateData({...createData, customer_name: e.target.value})} />
                        <input className="w-full rounded border px-3 py-2 text-sm" placeholder="Phone *" required value={createData.phone_number} onChange={e => setCreateData({...createData, phone_number: e.target.value})} />
                        <textarea className="w-full rounded border px-3 py-2 text-sm" placeholder="Address" rows="2" value={createData.address} onChange={e => setCreateData({...createData, address: e.target.value})} />
                        <select className="w-full rounded border px-3 py-2 text-sm" value={createData.order_source} onChange={e => setCreateData({...createData, order_source: e.target.value})}>
                            {SOURCES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="rounded-lg border bg-white p-3 space-y-2">
                          <div className="text-xs font-bold text-gray-600 uppercase">Delivery</div>
                          <select
                            className="w-full rounded border px-3 py-2 text-sm"
                            value={createData.delivery_city_id}
                            onChange={(e) => {
                              const cityId = e.target.value;
                              setCreateData(s => ({ ...s, delivery_city_id: cityId }));
                            }}
                          >
                            <option value="">Select City</option>
                            {deliveryCities.filter(c => Number(c.is_active ?? 1) === 1).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              className="w-full rounded border px-3 py-2 text-sm"
                              type="number"
                              step="1"
                              placeholder="Delivery fee"
                              value={(() => {
                                const cityId = createData.delivery_city_id ? Number(createData.delivery_city_id) : null;
                                const fee = cityId ? deliveryCities.find(c => Number(c.id) === cityId)?.fee : '';
                                return fee != null ? fee : '';
                              })()}
                              disabled
                            />
                            <div className="text-xs text-gray-500 flex items-center justify-end">
                              Free ≥ {DELIVERY_FREE_THRESHOLD.toLocaleString()}
                            </div>
                          </div>
                          {(() => {
                            const cartTotal = createData.items.reduce((sum, it) => sum + toNum(it.price) * toNum(it.quantity), 0);
                            const isWebsite = String(createData.order_source || '').toLowerCase() === 'website';
                            const canToggle = !isWebsite && cartTotal >= DELIVERY_FREE_THRESHOLD;
                            const forcedClient = cartTotal < DELIVERY_FREE_THRESHOLD;
                            const checked = forcedClient ? false : createData.delivery_paid_by === 'medlan';
                            return (
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-gray-700">Free delivery for customer</div>
                                <label className={`inline-flex items-center gap-2 ${canToggle ? '' : 'opacity-60'}`}>
                                  <input
                                    type="checkbox"
                                    disabled={!canToggle}
                                    checked={checked}
                                    onChange={(e) => setCreateData(s => ({ ...s, delivery_paid_by: e.target.checked ? 'medlan' : 'client' }))}
                                  />
                                  <span className="text-xs text-gray-500">Medlan pays</span>
                                </label>
                              </div>
                            );
                          })()}
                        </div>
                    </form>

                    <h4 className="font-bold text-sm mt-6 mb-3 flex justify-between">
                        <span>Cart Items</span>
                        <span>{createData.items.length}</span>
                    </h4>
                    <div className="space-y-2">
                        {createData.items.length === 0 ? <div className="text-sm text-gray-400 italic">Cart is empty</div> : (
                            createData.items.map((it, idx) => (
                                <div key={idx} className="bg-white p-2 rounded border shadow-sm text-sm">
                                    <div>
                                        <div className="font-medium truncate w-32">{it.product_name}</div>
                                        <div className="text-xs text-gray-500">{it.color_name} / {it.size_name}</div>
                                        <div className="text-xs text-blue-600">{toNum(it.price).toLocaleString()} IQD</div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-12 gap-2 items-center">
                                      <div className="col-span-7">
                                        <div className="text-[11px] text-gray-500">Unit price</div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            step="1"
                                            className="w-full border rounded px-2 py-1"
                                            value={it.price ?? ''}
                                            onChange={(e) => {
                                              const raw = e.target.value;
                                              const promo = toNum(it.promo_price ?? it.base_price ?? it.price);
                                              const purchase = it.purchase_price != null ? toNum(it.purchase_price) : null;
                                              let vNum = raw === '' ? 0 : toNum(raw);
                                              if (purchase != null && purchase > 0) vNum = Math.max(purchase, vNum);
                                              vNum = Math.min(promo, vNum);
                                              const v = raw === '' ? '' : String(vNum);
                                              setCreateData(prev => ({
                                                ...prev,
                                                items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, price: v } : item)
                                              }));
                                            }}
                                            min={it.purchase_price != null ? toNum(it.purchase_price) : undefined}
                                            max={toNum(it.promo_price ?? it.base_price ?? it.price)}
                                          />
                                          <button
                                            type="button"
                                            className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                                            onClick={() => setCreateData(prev => ({
                                              ...prev,
                                              items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, price: item.promo_price } : item)
                                            }))}
                                          >
                                            Reset
                                          </button>
                                        </div>
                                        <div className="mt-1 text-[11px] text-gray-400">
                                          {isAdmin && it.purchase_price != null ? `Purchase: ${toNum(it.purchase_price).toLocaleString()} • ` : ''}
                                          Promo: {toNum(it.promo_price ?? it.base_price ?? it.price).toLocaleString()}
                                        </div>
                                      </div>
                                      <div className="col-span-4">
                                        <div className="text-[11px] text-gray-500 text-center">Qty</div>
                                        <input
                                          type="number"
                                          className="w-full text-center border rounded px-2 py-1"
                                          value={it.quantity}
                                          min="1"
                                          max={it.stock}
                                          onChange={(e) => {
                                            const v = Math.min(Number(e.target.value), it.stock);
                                            setCreateData(prev => ({
                                              ...prev,
                                              items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, quantity: v } : item)
                                            }));
                                          }}
                                        />
                                      </div>
                                      <div className="col-span-1 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={() => setCreateData(prev => ({...prev, items: prev.items.filter(i => i.product_spec_id !== it.product_spec_id)}))}
                                          className="text-red-500 hover:text-red-700 p-1"
                                          aria-label="Remove"
                                        >
                                          &times;
                                        </button>
                                      </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Product Search */}
                <div className="w-full md:w-2/3 p-6 overflow-y-auto">
                    <div className="mb-4">
                        <input 
                            className="w-full border rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Search products to add..." 
                            value={specSearch}
                            onChange={e => setSpecSearch(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Search Results */}
                    {!selectedProduct ? (
                        <div className="grid grid-cols-1 gap-2">
                            {isSearching && <div className="text-gray-500 text-sm">Searching...</div>}
                            {specResults.map(p => (
                                <div key={p.id} onClick={() => selectProductForCreate(p)} className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-blue-600 text-sm">Select &rarr;</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                             <button onClick={() => { setSelectedProduct(null); setSpecSearch(''); }} className="text-sm text-gray-500 mb-4 hover:text-gray-800">&larr; Back to Search</button>
                             <div className="font-bold text-lg mb-2">{selectedProduct.name}</div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="p-2">Variant</th>
                                            <th className="p-2">Stock</th>
                                            <th className="p-2">Price</th>
                                            <th className="p-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {selectedProduct.specs.map(sp => (
                                            <tr key={sp.id}>
                                                <td className="p-2">{sp.color_name || sp.color_id} / {sp.size_name || sp.size_id}</td>
                                                <td className="p-2 font-medium">{sp.stock}</td>
                                                <td className="p-2">{Number(sp.final_price || sp.price).toLocaleString()}</td>
                                                <td className="p-2">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => addToCart(sp, selectedProduct.name)} 
                                                        disabled={sp.stock < 1}
                                                        className={`px-3 py-1 rounded text-xs text-white ${sp.stock < 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                    >
                                                        {sp.stock < 1 ? 'Out of Stock' : 'Add'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3">
                <button onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" form="createOrderForm" disabled={createData.items.length === 0} className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 disabled:opacity-50">Create Order</button>
            </div>
          </div>
        </div>
      )}

      {deliverySettingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{marginTop:'0px'}}>
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">Delivery Settings</h3>
              <button onClick={() => setDeliverySettingsOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="text-sm text-gray-600 mb-3">Set delivery fees per city.</div>
              {deliveryCitiesApiMissing ? (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Endpoint /api/delivery-cities not found. Backend ـەکەت پێویستی بە update هەیە (routes + controller + DB migration).
                </div>
              ) : null}
              {deliveryCitiesLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-3">
                  {deliveryCities.map((c) => (
                    <div key={c.id} className="border rounded-xl p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-3">
                          <label className="text-xs text-gray-500">Key</label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={c.city_key || ''}
                            onChange={(e) => setDeliveryCities((s) => s.map(x => Number(x.id) === Number(c.id) ? { ...x, city_key: e.target.value } : x))}
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="text-xs text-gray-500">Name</label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            value={c.name || ''}
                            onChange={(e) => setDeliveryCities((s) => s.map(x => Number(x.id) === Number(c.id) ? { ...x, name: e.target.value } : x))}
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-xs text-gray-500">Fee (IQD)</label>
                          <input
                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                            type="number"
                            step="1"
                            value={c.fee ?? ''}
                            onChange={(e) => setDeliveryCities((s) => s.map(x => Number(x.id) === Number(c.id) ? { ...x, fee: e.target.value } : x))}
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Number(c.is_active ?? 1) === 1}
                              onChange={(e) => setDeliveryCities((s) => s.map(x => Number(x.id) === Number(c.id) ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))}
                            />
                            <span className="text-xs text-gray-600">Active</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
                          onClick={() => deleteDeliveryCity(c.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="px-3 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800"
                          onClick={() => updateDeliveryCity(c.id, { city_key: c.city_key, name: c.name, fee: Number(c.fee || 0), is_active: Number(c.is_active ?? 1) })}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                  {deliveryCities.length === 0 ? (
                    <div className="text-sm text-gray-400">No cities found.</div>
                  ) : null}
                </div>
              )}

              <div className="mt-6 border-t pt-4">
                <div className="text-sm font-semibold mb-2">Add City</div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-3">
                    <label className="text-xs text-gray-500">Key</label>
                    <input className="mt-1 w-full rounded border px-3 py-2 text-sm" value={newCity.city_key} onChange={(e) => setNewCity(s => ({ ...s, city_key: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="text-xs text-gray-500">Name</label>
                    <input className="mt-1 w-full rounded border px-3 py-2 text-sm" value={newCity.name} onChange={(e) => setNewCity(s => ({ ...s, name: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500">Fee</label>
                    <input className="mt-1 w-full rounded border px-3 py-2 text-sm" type="number" step="1" value={newCity.fee} onChange={(e) => setNewCity(s => ({ ...s, fee: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="text-xs text-gray-500">Active</label>
                    <div className="mt-2">
                      <input type="checkbox" checked={Number(newCity.is_active) === 1} onChange={(e) => setNewCity(s => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} />
                    </div>
                  </div>
                  <div className="sm:col-span-1">
                    <button className="w-full rounded bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700" onClick={createDeliveryCity}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              <button className="px-4 py-2 rounded border hover:bg-white" onClick={() => { fetchDeliveryCities(); setDeliverySettingsOpen(false); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
