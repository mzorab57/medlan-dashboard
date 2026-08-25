import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { downloadCSV } from '../../lib/csv';
import { useToast } from '../../store/toast';
import { STATUSES, normalizeStatus, canTransition, isLocked, statusBgClass } from '../../lib/status';
import { useAuth } from '../../store/auth';
import AdminButton from '../../components/ui/AdminButton';
import AdminDrawer from '../../components/ui/AdminDrawer';

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

function uniqueById(list) {
 const seen = new Set();
 const out = [];
 (Array.isArray(list) ? list : []).forEach((item, index) => {
 const key = item?.id != null ? `id:${item.id}` : `idx:${index}`;
 if (seen.has(key)) return;
 seen.add(key);
 out.push(item);
 });
 return out;
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
 campaign_id: '',
 items: [],
 delivery_city_id: '',
 delivery_paid_by: 'medlan'
 });

 const [campaigns, setCampaigns] = useState([]);
 const [campaignsLoading, setCampaignsLoading] = useState(false);
 const [createCampaignLoading, setCreateCampaignLoading] = useState(false);
 const [createCampaignData, setCreateCampaignData] = useState(null);
 const [createCampaignSelected, setCreateCampaignSelected] = useState({});
 
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

 useEffect(() => {
 if (!createOpen) return;
 let mounted = true;
 (async () => {
 setCampaignsLoading(true);
 try {
 const res = await api.get('/api/campaigns?active=1');
 const list = res?.data || res || [];
 if (mounted) setCampaigns(Array.isArray(list) ? list : []);
 } catch {
 if (mounted) setCampaigns([]);
 } finally {
 if (mounted) setCampaignsLoading(false);
 }
 })();
 return () => { mounted = false; };
 }, [createOpen]);

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
 setSpecResults(uniqueById(res.data || res || []));
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
 setEditSpecResults(uniqueById(res.data || res || []));
 } catch { setEditSpecResults([]); }
 finally { setEditIsSearching(false); }
 }, 300);
 return () => clearTimeout(t);
 }, [editSpecSearch]);

 async function selectProductForCreate(prod) {
 try {
 const res = await api.get(`/api/products/${prod.id}/specs`);
 const specs = uniqueById(Array.isArray(res) ? res : (res.data || []));
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
 const specs = uniqueById(Array.isArray(res) ? res : (res.data || []));
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

 function clearCreateCampaign(keepCustomerFields = true) {
 setCreateCampaignData(null);
 setCreateCampaignSelected({});
 setSelectedProduct(null);
 setSpecSearch('');
 setSpecResults([]);
 setCreateData((s) => ({
 ...(keepCustomerFields ? s : {
 customer_name: '',
 phone_number: '',
 address: '',
 order_source: 'whatsapp',
 delivery_city_id: '',
 delivery_paid_by: 'medlan',
 }),
 campaign_id: '',
 items: [],
 }));
 }

 function rebuildCampaignCart(data, selectedMap) {
 const display = Array.isArray(data?.display_items) ? data.display_items : [];
 const extra = Array.isArray(data?.extra_pool_items) ? data.extra_pool_items : [];
 const byId = {};
 [...display, ...extra].forEach((it) => { byId[Number(it.product_spec_id)] = it; });
 const sel = selectedMap || {};
 const out = [];
 const addItem = (it) => {
 const specId = Number(it.product_spec_id);
 if (!sel[specId]) return;
 const overridePrice = toNum(it.override_price);
 out.push({
 product_spec_id: specId,
 product_name: it.product_name,
 color_name: it.color_name || it.color_id,
 size_name: it.size_name || it.size_id,
 price: overridePrice,
 promo_price: overridePrice,
 base_price: toNum(it.price),
 purchase_price: null,
 promo_discount_amount: Math.max(0, toNum(it.price) - overridePrice),
 quantity: 1,
 stock: it.stock,
 });
 };
 display.forEach(addItem);
 extra.forEach(addItem);
 return out;
 }

 async function selectCreateCampaign(nextId) {
 const idNum = Number(nextId || 0);
 if (!idNum) {
 clearCreateCampaign(true);
 return;
 }
 setCreateCampaignLoading(true);
 try {
 const res = await api.get(`/api/campaigns/${idNum}`);
 setCreateCampaignData(res);
 const display = Array.isArray(res?.display_items) ? res.display_items : [];
 const initial = {};
 display.forEach((it) => { initial[Number(it.product_spec_id)] = true; });
 setCreateCampaignSelected(initial);
 setCreateData((s) => ({
 ...s,
 campaign_id: String(idNum),
 items: rebuildCampaignCart(res, initial),
 }));
 } catch (e) {
 add(e.message || 'Failed to load campaign', 'error');
 clearCreateCampaign(true);
 } finally {
 setCreateCampaignLoading(false);
 }
 }

 async function submitOrder(e) {
 e.preventDefault();
 try {
 if (createData.campaign_id && createCampaignData) {
 const constraints = createCampaignData.constraints || {};
 const displayLimit = Number(constraints.display_limit || 0);
 const extraLimit = Number(constraints.extra_pool_limit || 0);
 const minCount = Number(constraints.min_selectable_count || 0);
 const maxCount = Number(constraints.max_selectable_count || displayLimit || 0);
 const extraItems = Array.isArray(createCampaignData.extra_pool_items) ? createCampaignData.extra_pool_items : [];
 const extraSet = {};
 extraItems.forEach((it) => { extraSet[Number(it.product_spec_id)] = true; });
 const selectedCount = createData.items.length;
 const extraSelected = createData.items.filter((it) => extraSet[Number(it.product_spec_id)]).length;
 const valid = selectedCount >= minCount && selectedCount <= maxCount && extraSelected <= extraLimit;
 if (!valid) {
 add('Campaign selection is not valid', 'error');
 return;
 }
 }
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
 campaign_id: createData.campaign_id ? Number(createData.campaign_id) : undefined,
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
 setCreateCampaignData(null);
 setCreateCampaignSelected({});
 setCreateData({
 customer_name: '',
 phone_number: '',
 address: '',
 order_source: 'whatsapp',
 campaign_id: '',
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
 <div className="space-y-6 text-[#1F2A5A]">
 {/* HEADER */}
 <div className="flex items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-semibold text-[#1F2A5A]">Orders Module</h2>
 <p className="text-sm text-[#1F2A5A]/50">Track payments, sources, and order actions from one place.</p>
 </div>
 <div className="flex items-center gap-2">
 <AdminButton onClick={() => setDeliverySettingsOpen(true)} variant="secondary">
 Delivery Settings
 </AdminButton>
 <AdminButton onClick={() => setCreateOpen(true)} variant="primary">
 + Create Order
 </AdminButton>
 </div>
 </div>
 {error ? (
 <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
 {error}
 </div>
 ) : null}

 {/* SUMMARY CARDS (Compact) */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
 {Object.entries(summary).map(([key, val]) => (
 <div key={key} className="rounded-[16px] border border-[#1F2A5A]/15 bg-[#f9fafb] p-4 flex flex-col justify-between">
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest">{key}</div>
 <div className="text-2xl font-semibold mt-2 text-[#1F2A5A]">{val}</div>
 </div>
 ))}
 </div>

 {/* FILTERS & ACTIONS */}
 <div className="admin-shell-panel p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
 <div className="flex gap-3 w-full md:w-auto">
 <select className="admin-shell-input w-full md:w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
 <option value="">All Statuses</option>
 {STATUSES.filter(s => !['processing', 'returned'].includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 <select className="admin-shell-input w-full md:w-40" value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}>
 <option value="">All Sources</option>
 {SOURCES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 <AdminButton onClick={handleExport} variant="secondary" className="w-full md:w-auto">
 Export CSV
 </AdminButton>
 </div>

 {/* TABLE */}
 <div className="admin-shell-panel overflow-hidden">
 {loading ? (
 <div className="p-10 text-center text-[#1F2A5A]/50">Loading orders...</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="min-w-full text-sm">
 <thead className="border-b border-[#1F2A5A]/15 bg-[#f3f4f6]/50">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">ORDER</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">CUSTOMER</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">SOURCE</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">CAMPAIGN</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">AMOUNT</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">STATUS</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">DATE</th>
 <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#1F2A5A]/50">ACTION</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1F2A5A]">
 {items.map((o) => (
 <tr key={o.id} className="cursor-pointer transition-colors hover:bg-[#ffffff]" onClick={() => { setViewId(o.id); fetchView(o.id); }}>
 <td className="px-4 py-3 font-semibold text-[#1F2A5A]">ORD-{o.id}</td>
 <td className="px-4 py-3">
 <div className="font-semibold text-[#1F2A5A]">{o.customer_name}</div>
 <div className="text-xs text-[#1F2A5A]/50">{o.phone_number}</div>
 </td>
 <td className="px-4 py-3">
 <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
 normalizeSource(o.order_source) === 'wa' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
 normalizeSource(o.order_source) === 'insta' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
 'border-[#1F2A5A]/20 bg-[#1F2A5A]/10 text-[#1F2A5A]'
 }`}>
 {displaySource(o.order_source)}
 </span>
 </td>
 <td className="px-4 py-3">
 {o.campaign_id ? (
 <span className="text-[10px] px-2 py-0.5 rounded-full border bg-[#4BB7D8]/10 text-[#4BB7D8] border-[#4BB7D8]/20">
 {o.campaign_name || `#${o.campaign_id}`}
 </span>
 ) : (
 <span className="text-xs text-[#1F2A5A]/70">—</span>
 )}
 </td>
 <td className="px-4 py-3 font-semibold text-[#1F2A5A]">IQD {Number(o.total_price).toLocaleString()}</td>
 <td className="px-4 py-3">
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
 o.status === 'completed' || o.status === 'paid' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' :
 o.status === 'pending' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                        o.status === 'cancelled' ? 'border-red-500/30 bg-red-500/10 text-red-500' :
 'border-[#1F2A5A]/20 bg-[#1F2A5A]/10 text-[#1F2A5A]'
 }`}>
 {o.status}
 </span>
 </td>
 <td className="px-4 py-3 text-[#1F2A5A]/50 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
 <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
 {!isLocked(o.status) && (
 <select 
 className="text-xs border border-[#1F2A5A]/15 rounded-lg p-1 bg-[#f9fafb] text-[#1F2A5A]/80 outline-none focus:border-[#4BB7D8]/50"
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
 <div className="p-3 border-t border-[#1F2A5A]/15 flex justify-between items-center bg-[#f9fafb]">
 <button disabled={page<=1} onClick={() => setPage(p => p-1)} className="px-3 py-1 border border-[#1F2A5A]/15 rounded-lg bg-[#ffffff] text-[#1F2A5A]/80 disabled:opacity-50 hover:bg-[#1F2A5A] transition-colors">Prev</button>
 <span className="text-sm text-[#1F2A5A]/50">Page {page}</span>
 <button onClick={() => setPage(p => p+1)} className="px-3 py-1 border border-[#1F2A5A]/15 rounded-lg bg-[#ffffff] text-[#1F2A5A]/80 hover:bg-[#1F2A5A] transition-colors">Next</button>
 </div>
 </div>

 {/* VIEW ORDER MODAL */}
 <AdminDrawer
 open={!!viewId}
 onClose={() => setViewId(null)}
 size="xl"
 eyebrow="Order Drawer"
 title={viewId ? `Order Details #${viewId}` : 'Order Details'}
 subtitle={viewData?.order?.campaign_id ? `Campaign: ${viewData?.order?.campaign_name || `#${viewData?.order?.campaign_id}`}` : 'View, update, and review order actions.'}
 >
 <div className="flex-1 overflow-y-auto">
 {viewLoading || !viewData ? (
 <div className="text-center py-10">Loading details...</div>
 ) : (
 <div className="space-y-6">
 {/* Customer Info */}
 <div className="grid grid-cols-2 gap-4 text-sm">
 <div className="p-4 bg-[#ffffff] rounded-xl border border-[#1F2A5A]/15 ">
 <div className="text-[10px] text-[#1F2A5A]/50 uppercase tracking-widest font-semibold mb-1">Customer</div>
 <div className="font-bold text-[#1F2A5A] text-base">{viewData.order?.customer_name}</div>
 <div className="text-[#1F2A5A]/60 mt-1">{viewData.order?.phone_number}</div>
 </div>
 <div className="p-4 bg-[#ffffff] rounded-xl border border-[#1F2A5A]/15 ">
 <div className="text-[10px] text-[#1F2A5A]/50 uppercase tracking-widest font-semibold mb-1">Shipping</div>
 <div className="text-[#1F2A5A]/80">{stripMetaFromAddress(viewData.order?.address) || 'No address provided'}</div>
 <div className={`mt-2 inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBgClass(viewData.order?.status)}`}>{viewData.order?.status}</div>
 {viewData?.order?.campaign_id ? (
 <div className="mt-3">
 <span className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest">Campaign</span>
 <div className="mt-1.5">
 <span className="text-xs px-2.5 py-1 rounded-lg border border-[#4BB7D8]/20 bg-[#4BB7D8]/10 text-[#4BB7D8] font-medium">
 {viewData?.order?.campaign_name || `#${viewData?.order?.campaign_id}`}
 </span>
 </div>
 </div>
 ) : null}
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
 const fee = o.delivery_fee != null ? Number(o.delivery_fee) : (byId?.fee != null ? Number(byId.fee) : (inferred?.fee != null ? Number(inferred.fee) : null));
 const paidLabel = paidBy === 'medlan' ? 'Free (Medlan)' : 'Customer pays';
 const feeLabel = fee != null ? fee.toLocaleString() : '—';
 return (
 <>
 <div className="p-4 bg-[#ffffff] rounded-xl border border-[#1F2A5A]/15 ">
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest mb-1">City</div>
 <div className="font-bold text-[#1F2A5A]">{cityName || '—'}</div>
 </div>
 <div className="p-4 bg-[#ffffff] rounded-xl border border-[#1F2A5A]/15 ">
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest mb-1">Delivery</div>
 <div className="font-bold text-[#1F2A5A]">{paidLabel}</div>
 </div>
 <div className="p-4 bg-[#ffffff] rounded-xl border border-[#1F2A5A]/15 ">
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest mb-1">Delivery Fee</div>
 <div className="font-bold text-[#4BB7D8]">{feeLabel} <span className="text-[10px] font-normal text-[#1F2A5A]/50 ml-0.5">IQD</span></div>
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
 const deliveryPaidBy = String(o.delivery_paid_by || '').toLowerCase() || (Number(o.total_price || 0) >= DELIVERY_FREE_THRESHOLD ? 'medlan' : 'client');
 const cityId = o.delivery_city_id != null ? Number(o.delivery_city_id) : null;
 const address = String(o.address || '').toLowerCase();
 const byId = cityId ? deliveryCities.find(c => Number(c.id) === cityId) : null;
 const inferred = deliveryCities.find(c => address.includes(String(c.city_key || '').toLowerCase()) || address.includes(String(c.name || '').toLowerCase()));
 const deliveryFeeRaw = o.delivery_fee != null ? Number(o.delivery_fee) : (byId?.fee != null ? Number(byId.fee) : (inferred?.fee != null ? Number(inferred.fee) : null));
 const effectiveDeliveryFee = deliveryPaidBy === 'client' ? toNum(deliveryFeeRaw) : 0;
 const oid = Number(o.id || viewId);
 const queuedDiscount = pendingDiscountByOrderId?.[oid];
 const effectiveDiscount = Number(queuedDiscount != null ? queuedDiscount : currentDiscount);
 const draft = toNum(discountDraft || 0);
 const invalid = !Number.isFinite(draft) || draft < 0 || draft > maxDiscount;
 const netProfit = grossProfit - effectiveDiscount;
 return (
 <>
 <div className="rounded-xl border border-[#1F2A5A]/15 bg-[#f3f4f6] p-5 ">
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
 <div>
 <div className="text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest mb-1">Discount</div>
 <div className="text-xs text-[#1F2A5A]/60 font-medium space-x-2">
 <span>Max: <span className="text-[#1F2A5A]">{maxDiscount.toLocaleString()}</span></span>
 {isAdmin ? <><span className="text-[#1F2A5A]/70">•</span> <span>Gross profit: <span className="text-emerald-400">{grossProfit.toLocaleString()}</span></span> <span className="text-[#1F2A5A]/70">•</span> <span>Net profit: <span className="text-[#4BB7D8]">{netProfit.toLocaleString()}</span></span></> : ''}
 {queuedDiscount != null && editable ? <><span className="text-[#1F2A5A]/70">•</span> <span>Queued: <span className="text-blue-400">{Number(queuedDiscount).toLocaleString()}</span></span></> : ''}
 </div>
 </div>
 <div className="flex items-center gap-2">
 <input
 className={`w-40 rounded-lg border bg-[#f9fafb] text-[#1F2A5A] px-3 py-2 text-sm focus:border-[#4BB7D8]/50 outline-none transition-all ${invalid ? 'border-red-500/50 focus:border-red-500' : 'border-[#1F2A5A]/15'}`}
 type="number"
 step="1"
 value={discountDraft}
 onChange={(e) => setDiscountDraft(e.target.value)}
 disabled={!editable || discountSaving}
 placeholder="Discount"
 />
 <button
 type="button"
 className="px-4 py-2 rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] font-semibold text-sm hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40 disabled:opacity-50 transition-colors"
 disabled={!editable || discountSaving || invalid}
 onClick={() => applyDiscount(viewId, draft)}
 >
 Queue
 </button>
 <button
 type="button"
 className="px-4 py-2 rounded-lg border border-[#1F2A5A]/15 text-[#1F2A5A]/80 text-sm hover:bg-[#1F2A5A] disabled:opacity-50 transition-colors"
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

 <div className="overflow-hidden rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff]">
 <table className="w-full text-sm border-collapse">
 <thead className="bg-[#f3f4f6]/50">
 <tr className="border-b border-[#1F2A5A]/15 text-[#1F2A5A]/50 text-[10px] tracking-wider uppercase font-semibold">
 <th className="text-left px-4 py-3">Item</th>
 <th className="text-center px-4 py-3">Qty</th>
 <th className="text-right px-4 py-3">Price</th>
 <th className="text-right px-4 py-3">Total</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1F2A5A]">
 {list.map((it, idx) => (
 <tr key={it.id ?? `${it.product_spec_id}-${idx}`} className="hover:bg-[#1F2A5A]/30 transition-colors">
 <td className="px-4 py-3">
 <div className="flex items-center gap-3">
 <button
 type="button"
 className="relative h-10 w-10 rounded-lg border border-[#1F2A5A]/15 bg-[#f9fafb] overflow-hidden flex items-center justify-center cursor-pointer"
 onClick={() => {
 if (!it.variant_image) return;
 setImagePreview(assetUrl(it.variant_image));
 }}
 aria-label="Preview item image"
 >
 <span className="text-[10px] text-[#1F2A5A]/70 font-bold">N/A</span>
 {it.variant_image ? (
 <img src={assetUrl(it.variant_image)} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
 ) : null}
 </button>
 <div>
 <div className="font-semibold text-[#1F2A5A]">{it.product_name || `Product #${it.product_id}`}</div>
 <div className="text-[10px] font-medium tracking-wider uppercase text-[#1F2A5A]/50 mt-0.5">
 {it.color_name} {it.size_name && `• ${it.size_name}`}
 </div>
 </div>
 </div>
 </td>
 <td className="text-center px-4 py-3 font-medium text-[#1F2A5A]">{it.quantity}</td>
 <td className="text-right px-4 py-3">
 {editable ? (
 <div className="flex items-center justify-end gap-2">
 <input
 className="w-28 border border-[#1F2A5A]/15 bg-[#f9fafb] text-[#1F2A5A] rounded-lg px-2 py-1.5 text-right outline-none focus:border-[#4BB7D8]/50 transition-all"
 type="number"
 step="1"
 value={itemPriceDraftById[it.id] ?? String(it.price ?? '')}
 max={toNum(it.variant_current_price ?? it.price ?? 0)}
 onChange={(e) => {
 const v = e.target.value;
 setItemPriceDraftById((s) => ({ ...(s || {}), [it.id]: v }));
 }}
 />
 <button
 type="button"
 className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1.5 rounded-lg border border-[#1F2A5A]/15 text-[#1F2A5A]/80 hover:bg-[#1F2A5A] hover:text-[#1F2A5A] disabled:opacity-50 transition-colors"
 disabled={itemPriceSavingById[it.id]}
 onClick={async () => {
 const draft = toNum(itemPriceDraftById[it.id] ?? it.price);
 const maxP = toNum(it.variant_current_price ?? it.price ?? 0);
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
 className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 disabled:opacity-50 transition-colors"
 disabled={itemPriceSavingById[it.id]}
 onClick={() => deleteItemFromOrder(it.id)}
 >
 Delete
 </button>
 </div>
 ) : (
 <span className="text-[#1F2A5A]/80">{Number(it.price).toLocaleString()}</span>
 )}
 </td>
 <td className="text-right px-4 py-3 font-bold text-[#1F2A5A]">{(Number(it.quantity || 0) * Number(it.price || 0)).toLocaleString()}</td>
 </tr>
 ))}
 </tbody>
 <tfoot className="border-t border-[#1F2A5A]/15 bg-[#f3f4f6]/30">
 <tr>
 <td colSpan="3" className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-widest text-[#1F2A5A]/50">Subtotal</td>
 <td className="text-right px-4 py-3 font-bold text-[#1F2A5A]">{subtotal.toLocaleString()}</td>
 </tr>
 <tr>
 <td colSpan="3" className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-widest text-[#1F2A5A]/50">Order Discount</td>
 <td className="text-right px-4 py-3 font-bold text-emerald-400">{currentDiscount ? `-${currentDiscount.toLocaleString()}` : '0'}</td>
 </tr>
 <tr>
 <td colSpan="3" className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-widest text-[#1F2A5A]/50">Delivery Fee</td>
 <td className="text-right px-4 py-3 font-bold text-[#1F2A5A]">{effectiveDeliveryFee ? effectiveDeliveryFee.toLocaleString() : '0'}</td>
 </tr>
 {queuedDiscount != null && editable ? (
 <tr>
 <td colSpan="3" className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-widest text-[#1F2A5A]/50">Queued Discount</td>
 <td className="text-right px-4 py-3 font-bold text-blue-400">{`-${Number(queuedDiscount).toLocaleString()}`}</td>
 </tr>
 ) : null}
 <tr className="border-t border-[#1F2A5A]/15">
 <td colSpan="3" className="text-right px-4 py-4 font-bold text-xs uppercase tracking-widest text-[#1F2A5A]/60">Total</td>
 <td className="text-right px-4 py-4 font-black text-xl text-[#4BB7D8]">
 {toNum(o.total_price ?? ((subtotal - currentDiscount) + effectiveDeliveryFee) ?? 0).toLocaleString()} <span className="text-[10px] font-semibold tracking-widest uppercase text-[#1F2A5A]/50 ml-1">IQD</span>
 </td>
 </tr>
 {queuedDiscount != null && editable ? (
 <tr>
 <td colSpan="3" className="text-right px-4 py-3 font-semibold text-[10px] uppercase tracking-widest text-[#1F2A5A]/50">Preview Total (After Completed)</td>
 <td className="text-right px-4 py-3 font-bold text-lg text-[#4BB7D8]">{(Math.max(0, (subtotal - toNum(queuedDiscount || 0))) + effectiveDeliveryFee).toLocaleString()}</td>
 </tr>
 ) : null}
 </tfoot>
 </table>
 </div>

 {editable ? (
 <div className="mt-4 rounded-xl border border-[#1F2A5A]/15 bg-[#f3f4f6] p-5 ">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest mb-1">Add Item</div>
 <div className="text-xs text-[#1F2A5A]/60">Search product, pick variant, then add to this order.</div>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-[10px] font-semibold uppercase tracking-widest text-[#1F2A5A]/50">Qty</div>
 <input
 className="w-20 border border-[#1F2A5A]/15 bg-[#f9fafb] text-[#1F2A5A] rounded-lg px-3 py-2 text-right outline-none focus:border-[#4BB7D8]/50 transition-all"
 type="number"
 min="1"
 step="1"
 value={editAddQty}
 onChange={(e) => setEditAddQty(Math.max(1, toNum(e.target.value)))}
 disabled={editAddLoading}
 />
 </div>
 </div>

 <div className="mt-4">
 {!editSelectedProduct ? (
 <>
 <input
 className="w-full rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-4 py-3 text-sm focus:border-[#4BB7D8]/50 outline-none transition-all "
 placeholder="Search products..."
 value={editSpecSearch}
 onChange={(e) => setEditSpecSearch(e.target.value)}
 disabled={editAddLoading}
 />
 <div className="mt-2 space-y-2">
 {editIsSearching ? <div className="text-xs text-[#1F2A5A]/50 p-2">Searching...</div> : null}
 {editSpecResults.map((p) => (
 <button
 key={p.id}
 type="button"
 className="w-full text-left p-3 border border-[#1F2A5A]/15 bg-[#ffffff] rounded-xl hover:border-[#4BB7D8]/50 transition-colors flex justify-between items-center"
 onClick={() => selectProductForEdit(p)}
 disabled={editAddLoading}
 >
 <div>
 <div className="font-semibold text-[#1F2A5A] text-sm">{p.name}</div>
 <div className="text-[10px] font-medium tracking-widest uppercase text-[#1F2A5A]/50 mt-0.5">Select variants</div>
 </div>
 <span className="text-[#4BB7D8] text-sm">&rarr;</span>
 </button>
 ))}
 </div>
 </>
 ) : (
 <div className="bg-[#ffffff] p-4 rounded-xl border border-[#1F2A5A]/15">
 <button
 type="button"
 className="text-xs text-[#1F2A5A]/60 mb-3 hover:text-[#1F2A5A] transition-colors"
 onClick={() => { setEditSelectedProduct(null); setEditSpecSearch(''); setEditSpecResults([]); }}
 disabled={editAddLoading}
 >
 &larr; Back to search
 </button>
 <div className="font-bold text-sm text-[#1F2A5A] mb-3">{editSelectedProduct.name}</div>
 <div className="space-y-2">
 {(editSelectedProduct.specs || []).map((sp) => (
 <div key={sp.id} className="flex items-center justify-between p-3 border border-[#1F2A5A]/15 bg-[#f3f4f6] rounded-lg">
 <div>
 <div className="text-xs font-semibold text-[#1F2A5A]/80">
 {sp.color_name || sp.color_id} {sp.size_name ? `• ${sp.size_name}` : ''}
 </div>
 <div className="text-[10px] font-medium uppercase tracking-widest text-[#1F2A5A]/50 mt-1">
 Stock: {sp.stock} <span className="mx-1">•</span> Price: <span className="text-[#1F2A5A]">{toNum(sp.final_price || sp.price).toLocaleString()}</span>
 </div>
 </div>
 <button
 type="button"
 className="text-xs border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] font-bold px-4 py-1.5 rounded-lg hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40 disabled:opacity-50 transition-colors"
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
 </AdminDrawer>
 {imagePreview ? (
 <div className="fixed inset-0 z-[60] bg-black/70 p-4 flex items-center justify-center" style={{marginTop:'0px'}} onMouseDown={() => setImagePreview('')}>
 <div className="relative w-full max-w-4xl max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
 <button
 type="button"
 className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-gray-600 flex items-center justify-center"
 onClick={() => setImagePreview('')}
 aria-label="Close image preview"
 >
 &times;
 </button>
 <div className="bg-white rounded-xl overflow-hidden ">
 <img src={imagePreview} alt="" className="w-full h-full max-h-[90vh] object-contain bg-black" />
 </div>
 </div>
 </div>
 ) : null}

 {/* CREATE ORDER MODAL */}
 <AdminDrawer
 open={createOpen}
 onClose={() => { setCreateOpen(false); clearCreateCampaign(false); }}
 size="full"
 eyebrow="Create Order"
 title="New Order"
 subtitle="Create a new order from the admin panel without changing any checkout logic."
 footer={
 <div className="flex justify-end gap-3 w-full">
 <AdminButton onClick={() => { setCreateOpen(false); clearCreateCampaign(false); }} variant="ghost">Cancel</AdminButton>
 <AdminButton
 type="submit"
 form="createOrderForm"
 disabled={createCampaignLoading || createData.items.length === 0}
 variant="primary"
 >
 Create Order
 </AdminButton>
 </div>
 }
 >
 <div className="flex h-full flex-col md:flex-row -mx-5 sm:-mx-7 -mt-5 sm:-mt-6">
 {/* LEFT: Customer Form & Cart */}
 <div className="w-full md:w-1/3 border-r border-[#1F2A5A]/15 p-5 sm:p-7 overflow-y-auto">
 <h4 className="font-bold text-sm text-[#1F2A5A] mb-4 uppercase tracking-wider">Customer Details</h4>
 <form id="createOrderForm" onSubmit={submitOrder} className="space-y-4">
 <input className="w-full rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-4 py-3 text-sm focus:border-[#4BB7D8]/50 focus:ring-2 focus:ring-[#4BB7D8]/20 outline-none transition-all" placeholder="Name *" value={createData.customer_name} onChange={e => setCreateData({...createData, customer_name: e.target.value})} />
 <input className="w-full rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-4 py-3 text-sm focus:border-[#4BB7D8]/50 focus:ring-2 focus:ring-[#4BB7D8]/20 outline-none transition-all" placeholder="Phone *" required value={createData.phone_number} onChange={e => setCreateData({...createData, phone_number: e.target.value})} />
 <textarea className="w-full rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-4 py-3 text-sm focus:border-[#4BB7D8]/50 focus:ring-2 focus:ring-[#4BB7D8]/20 outline-none transition-all resize-none" placeholder="Address" rows="2" value={createData.address} onChange={e => setCreateData({...createData, address: e.target.value})} />
 <select className="w-full rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-4 py-3 text-sm focus:border-[#4BB7D8]/50 focus:ring-2 focus:ring-[#4BB7D8]/20 outline-none transition-all" value={createData.order_source} onChange={e => setCreateData({...createData, order_source: e.target.value})}>
 {SOURCES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 <div className="rounded-xl border border-[#1F2A5A]/15 bg-[#f3f4f6] p-4 space-y-3">
 <div className="text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest">Campaign</div>
 <div className="flex items-center gap-2">
 <select
 className="w-full rounded-lg border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-3 py-2 text-sm focus:border-[#4BB7D8]/50 focus:ring-2 focus:ring-[#4BB7D8]/20 outline-none transition-all"
 value={createData.campaign_id}
 onChange={(e) => selectCreateCampaign(e.target.value)}
 disabled={campaignsLoading || createCampaignLoading}
 >
 <option value="">No campaign</option>
 {(campaigns || []).map((c) => (
 <option key={c.id} value={c.id}>{c.name}</option>
 ))}
 </select>
 {createData.campaign_id ? (
 <button
 type="button"
 className="px-3 py-2 text-sm border border-[#1F2A5A]/15 rounded-lg hover:bg-[#1F2A5A] text-[#1F2A5A]/80 transition-colors"
 onClick={() => clearCreateCampaign(true)}
 disabled={createCampaignLoading}
 >
 Clear
 </button>
 ) : null}
 </div>
 {campaignsLoading ? <div className="text-xs text-[#1F2A5A]/50">Loading campaigns...</div> : null}
 {createCampaignLoading ? <div className="text-xs text-[#1F2A5A]/50">Loading campaign items...</div> : null}
 {createData.campaign_id && createCampaignData ? (
 (() => {
 const constraints = createCampaignData.constraints || {};
 const displayItems = Array.isArray(createCampaignData.display_items) ? createCampaignData.display_items : [];
 const extraItems = Array.isArray(createCampaignData.extra_pool_items) ? createCampaignData.extra_pool_items : [];
 const displayLimit = Number(constraints.display_limit || 0);
 const extraLimit = Number(constraints.extra_pool_limit || 0);
 const minCount = Number(constraints.min_selectable_count || 0);
 const maxCount = Number(constraints.max_selectable_count || displayLimit || 0);
 const selected = createCampaignSelected || {};
 const selectedCount = Object.values(selected).filter(Boolean).length;
 const extraSelected = extraItems.filter((it) => selected[Number(it.product_spec_id)]).length;
 const total = [...displayItems, ...extraItems].reduce((sum, it) => {
 const sid = Number(it.product_spec_id);
 if (!selected[sid]) return sum;
 return sum + toNum(it.override_price);
 }, 0);
 const valid = selectedCount >= minCount && selectedCount <= maxCount && extraSelected <= extraLimit;
 const toggle = (specId, checked) => {
 setCreateCampaignSelected((prev) => {
 const next = { ...(prev || {}) };
 if (checked) next[specId] = true;
 else delete next[specId];
 setCreateData((s) => ({ ...s, items: rebuildCampaignCart(createCampaignData, next) }));
 return next;
 });
 };
 return (
 <div className="space-y-2">
 <div className="text-xs text-[#1F2A5A]/50 mb-2">
 Selected: <span className="text-[#1F2A5A]">{selectedCount}</span> • Min: {minCount} • Max: {maxCount} • Extra used: {extraSelected}/{extraLimit} • Total: <span className="text-[#1F2A5A]">IQD {total.toLocaleString()}</span>
 </div>
 {!valid && <div className="text-xs text-red-400">Campaign requirements not met.</div>}
 {displayItems.length > 0 ? (
 <div className="space-y-1">
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest mt-3 mb-2">Display Items</div>
 <div className="space-y-1 max-h-40 overflow-y-auto">
 {displayItems.map((it) => {
 const sid = Number(it.product_spec_id);
 const checked = !!selected[sid];
 const disableUncheck = checked && selectedCount <= minCount;
 const disableCheck = !checked && selectedCount >= maxCount;
 return (
 <label key={sid} className={`flex items-center gap-2 text-sm text-[#1F2A5A]/80 ${disableUncheck || disableCheck ? 'opacity-60' : ''}`}>
 <input
 type="checkbox"
 className="rounded border-[#1F2A5A]/15 bg-[#ffffff] text-[#4BB7D8] focus:ring-[#4BB7D8]"
 checked={checked}
 disabled={disableUncheck || disableCheck}
 onChange={(e) => toggle(sid, e.target.checked)}
 />
 <span className="truncate">{it.product_name} • {toNum(it.override_price).toLocaleString()}</span>
 </label>
 );
 })}
 </div>
 </div>
 ) : null}
 {extraItems.length > 0 ? (
 <div className="space-y-1">
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 uppercase tracking-widest mt-3 mb-2">Extra Items</div>
 <div className="space-y-1 max-h-40 overflow-y-auto">
 {extraItems.map((it) => {
 const sid = Number(it.product_spec_id);
 const checked = !!selected[sid];
 const disableCheck = !checked && (selectedCount >= maxCount || extraSelected >= extraLimit);
 return (
 <label key={sid} className={`flex items-center gap-2 text-sm text-[#1F2A5A]/80 ${disableCheck ? 'opacity-60' : ''}`}>
 <input
 type="checkbox"
 className="rounded border-[#1F2A5A]/15 bg-[#ffffff] text-[#4BB7D8] focus:ring-[#4BB7D8]"
 checked={checked}
 disabled={disableCheck}
 onChange={(e) => toggle(sid, e.target.checked)}
 />
 <span className="truncate">{it.product_name} • {toNum(it.override_price).toLocaleString()}</span>
 </label>
 );
 })}
 </div>
 </div>
 ) : null}
 </div>
 );
 })()
 ) : null}
 </div>
 <div className="rounded-xl border border-[#1F2A5A]/15 bg-[#f3f4f6] p-4 space-y-3">
 <div className="text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest">Delivery</div>
 <select
 className="w-full rounded-lg border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-3 py-2 text-sm focus:border-[#4BB7D8]/50 focus:ring-2 focus:ring-[#4BB7D8]/20 outline-none transition-all"
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
 className="w-full rounded-lg border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-3 py-2 text-sm outline-none"
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
 <div className="text-[10px] font-semibold text-[#1F2A5A]/50 flex items-center justify-end tracking-wider">
 FREE ≥ {DELIVERY_FREE_THRESHOLD.toLocaleString()}
 </div>
 </div>
 {(() => {
 const cartTotal = createData.items.reduce((sum, it) => sum + toNum(it.price) * toNum(it.quantity), 0);
 const isWebsite = String(createData.order_source || '').toLowerCase() === 'website';
 const canToggle = !isWebsite && cartTotal >= DELIVERY_FREE_THRESHOLD;
 const forcedClient = cartTotal < DELIVERY_FREE_THRESHOLD;
 const checked = forcedClient ? false : createData.delivery_paid_by === 'medlan';
 return (
 <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1F2A5A]/15">
 <div className="text-xs font-medium text-[#1F2A5A]/80">Free delivery for customer</div>
 <label className={`inline-flex items-center gap-2 ${canToggle ? '' : 'opacity-60'}`}>
 <input
 type="checkbox"
 className="rounded border-[#1F2A5A]/15 bg-[#ffffff] text-[#4BB7D8] focus:ring-[#4BB7D8]"
 disabled={!canToggle}
 checked={checked}
 onChange={(e) => setCreateData(s => ({ ...s, delivery_paid_by: e.target.checked ? 'medlan' : 'client' }))}
 />
 <span className="text-[10px] uppercase tracking-wider text-[#1F2A5A]/50">MedLan pays</span>
 </label>
 </div>
 );
 })()}
 </div>
 </form>

 <h4 className="font-bold text-sm text-[#1F2A5A] mt-8 mb-4 flex justify-between uppercase tracking-wider">
 <span>Cart Items</span>
 <span className="text-[#4BB7D8] bg-[#4BB7D8]/10 px-2 py-0.5 rounded-full">{createData.items.length}</span>
 </h4>
 <div className="space-y-3">
 {createData.items.length === 0 ? <div className="text-sm text-[#1F2A5A]/50 italic p-4 text-center border border-dashed border-[#1F2A5A]/15 rounded-xl">Cart is empty</div> : (
 createData.items.map((it, idx) => (
 <div key={idx} className="bg-[#ffffff] p-3 rounded-xl border border-[#1F2A5A]/15 text-sm transition-all hover:border-[#4BB7D8]/50">
 <div className="flex justify-between items-start">
 <div>
 <div className="font-semibold text-[#1F2A5A] truncate max-w-[200px]">{it.product_name}</div>
 <div className="text-[10px] text-[#1F2A5A]/50 font-medium tracking-wider uppercase mt-1">{it.color_name} / {it.size_name}</div>
 </div>
 <div className="text-sm font-bold text-[#1F2A5A]">{toNum(it.price).toLocaleString()} <span className="text-[10px] text-[#1F2A5A]/50 font-normal">IQD</span></div>
 </div>
 <div className="mt-4 grid grid-cols-12 gap-3 items-end">
 <div className="col-span-7">
 <div className="text-[10px] uppercase tracking-wider font-semibold text-[#1F2A5A]/50 mb-1">Unit price</div>
 <div className="flex items-center gap-2">
 <input
 type="number"
 step="1"
 className="w-full border border-[#1F2A5A]/15 bg-[#f9fafb] text-[#1F2A5A] rounded-lg px-2 py-1.5 focus:border-[#4BB7D8]/50 outline-none transition-all"
 value={it.price ?? ''}
 disabled={!!createData.campaign_id}
 onChange={(e) => {
 if (createData.campaign_id) return;
 const raw = e.target.value;
 const promo = toNum(it.promo_price ?? it.base_price ?? it.price);
 let vNum = raw === '' ? 0 : toNum(raw);
 vNum = Math.min(promo, vNum);
 const v = raw === '' ? '' : String(vNum);
 setCreateData(prev => ({
 ...prev,
 items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, price: v } : item)
 }));
 }}
 max={toNum(it.promo_price ?? it.base_price ?? it.price)}
 />
 {!createData.campaign_id ? (
 <button
 type="button"
 className="text-[10px] uppercase tracking-widest font-semibold px-2 py-1.5 rounded-lg border border-[#1F2A5A]/15 text-[#1F2A5A]/60 hover:bg-[#1F2A5A] hover:text-[#1F2A5A] transition-colors"
 onClick={() => setCreateData(prev => ({
 ...prev,
 items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, price: item.promo_price } : item)
 }))}
 >
 Reset
 </button>
 ) : null}
 </div>
 <div className="mt-1.5 text-[10px] text-[#1F2A5A]/50">
 {isAdmin && it.purchase_price != null ? `Purchase: ${toNum(it.purchase_price).toLocaleString()} • ` : ''}
 Promo: <span className="text-[#1F2A5A]/80">{toNum(it.promo_price ?? it.base_price ?? it.price).toLocaleString()}</span>
 </div>
 </div>
 <div className="col-span-3">
 <div className="text-[10px] uppercase tracking-wider font-semibold text-[#1F2A5A]/50 mb-1 text-center">Qty</div>
 <input
 type="number"
 className="w-full text-center border border-[#1F2A5A]/15 bg-[#f9fafb] text-[#1F2A5A] rounded-lg px-2 py-1.5 focus:border-[#4BB7D8]/50 outline-none transition-all"
 value={createData.campaign_id ? 1 : it.quantity}
 min="1"
 max={it.stock}
 disabled={!!createData.campaign_id}
 onChange={(e) => {
 if (createData.campaign_id) return;
 const v = Math.min(Number(e.target.value), it.stock);
 setCreateData(prev => ({
 ...prev,
 items: prev.items.map(item => item.product_spec_id === it.product_spec_id ? { ...item, quantity: v } : item)
 }));
 }}
 />
 </div>
 <div className="col-span-2 flex justify-end pb-0.5">
 <button
 type="button"
 onClick={() => {
 if (createData.campaign_id) return;
 setCreateData(prev => ({...prev, items: prev.items.filter(i => i.product_spec_id !== it.product_spec_id)}));
 }}
 disabled={!!createData.campaign_id}
 className={`p-1.5 rounded-lg ${createData.campaign_id ? 'text-[#1F2A5A]/70 cursor-not-allowed' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'} transition-colors`}
 aria-label="Remove"
 >
 <IconClose />
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
 {createData.campaign_id ? (
 <div className="rounded-xl border border-[#4BB7D8]/20 bg-[#4BB7D8]/10 text-[#4BB7D8] p-4">
 <div className="font-semibold text-sm">Campaign selected</div>
 <div className="text-xs mt-1 opacity-80">To add normal items, clear the campaign first.</div>
 </div>
 ) : (
 <>
 <div className="mb-4">
 <input 
 className="w-full rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A] px-4 py-3 focus:ring-2 focus:ring-[#4BB7D8]/20 focus:border-[#4BB7D8]/50 outline-none transition-all" 
 placeholder="Search products to add..." 
 value={specSearch}
 onChange={e => setSpecSearch(e.target.value)}
 autoFocus
 />
 </div>

 {!selectedProduct ? (
 <div className="grid grid-cols-1 gap-2">
 {isSearching && <div className="text-[#1F2A5A]/50 text-sm">Searching...</div>}
 {specResults.map(p => (
 <div key={p.id} onClick={() => selectProductForCreate(p)} className="p-3 rounded-xl border border-[#1F2A5A]/15 bg-[#ffffff] hover:border-[#4BB7D8]/50 cursor-pointer flex justify-between items-center transition-all">
 <span className="font-medium text-[#1F2A5A]">{p.name}</span>
 <span className="text-[#4BB7D8] text-sm">Select &rarr;</span>
 </div>
 ))}
 </div>
 ) : (
 <div>
 <button onClick={() => { setSelectedProduct(null); setSpecSearch(''); }} className="text-sm text-[#1F2A5A]/60 mb-4 hover:text-[#1F2A5A] transition-colors">&larr; Back to Search</button>
 <div className="font-bold text-lg mb-4 text-[#1F2A5A]">{selectedProduct.name}</div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="bg-[#f3f4f6]/50 text-[#1F2A5A]/50 border-b border-[#1F2A5A]/15">
 <tr>
 <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Variant</th>
 <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Stock</th>
 <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Price</th>
 <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Action</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[#1F2A5A]">
 {selectedProduct.specs.map(sp => (
 <tr key={sp.id} className="hover:bg-[#ffffff] transition-colors">
 <td className="p-3 text-[#1F2A5A]/80">{sp.color_name || sp.color_id} / {sp.size_name || sp.size_id}</td>
 <td className="p-3 font-medium text-[#1F2A5A]">{sp.stock}</td>
 <td className="p-3 text-[#1F2A5A]/80">{Number(sp.final_price || sp.price).toLocaleString()}</td>
 <td className="p-3">
 <button 
 type="button" 
 onClick={() => addToCart(sp, selectedProduct.name)} 
 disabled={sp.stock < 1}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${sp.stock < 1 ? 'bg-[#1F2A5A] text-[#1F2A5A]/50 cursor-not-allowed' : 'border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40'} transition-colors`}
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
 </>
 )}
 </div>
 </div>

 </AdminDrawer>

 <AdminDrawer
 open={deliverySettingsOpen}
 onClose={() => setDeliverySettingsOpen(false)}
 size="xl"
 eyebrow="Order Settings"
 title="Delivery Settings"
 subtitle="Manage delivery cities and fees without changing the order flow."
 headerBadge={
 deliveryCitiesApiMissing ? (
 <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">
 API Missing
 </span>
 ) : (
 <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
 {deliveryCities.length} Cities
 </span>
 )
 }
 footer={
 <div className="flex items-center justify-end gap-3">
 <AdminButton
 variant="ghost"
 onClick={() => {
 fetchDeliveryCities();
 setDeliverySettingsOpen(false);
 }}
 >
 Close
 </AdminButton>
 </div>
 }
 >
 <div className="space-y-6">
 <section className="admin-shell-panel p-5">
 <p className="text-sm text-[#1F2A5A]/60">
 Set delivery fees per city and keep active destinations available during order creation.
 </p>
 {deliveryCitiesApiMissing ? (
 <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
 Endpoint `/api/delivery-cities` not found. Backend update is still required.
 </div>
 ) : null}
 </section>

 <section className="space-y-3">
 {deliveryCitiesLoading ? (
 <div className="admin-shell-panel px-5 py-10 text-center text-sm text-[#1F2A5A]/60">
 Loading delivery cities...
 </div>
 ) : deliveryCities.length === 0 ? (
 <div className="admin-shell-panel px-5 py-10 text-center text-sm text-[#1F2A5A]/60">
 No cities found.
 </div>
 ) : (
 deliveryCities.map((c) => (
 <div key={c.id} className="admin-shell-panel p-5">
 <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
 <div>
 <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/70">
 City Entry
 </div>
 <div className="mt-1 text-base font-semibold text-[#1F2A5A]">{c.name || 'Untitled City'}</div>
 </div>
 <span
 className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
 Number(c.is_active ?? 1) === 1
 ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
 : 'border border-slate-700 bg-slate-900/80 text-[#1F2A5A]/60'
 }`}
 >
 {Number(c.is_active ?? 1) === 1 ? 'Active' : 'Inactive'}
 </span>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
 <div className="sm:col-span-3">
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">Key</label>
 <input
 className="admin-shell-input"
 value={c.city_key || ''}
 onChange={(e) => setDeliveryCities((s) => s.map((x) => (Number(x.id) === Number(c.id) ? { ...x, city_key: e.target.value } : x)))}
 />
 </div>
 <div className="sm:col-span-4">
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">Name</label>
 <input
 className="admin-shell-input"
 value={c.name || ''}
 onChange={(e) => setDeliveryCities((s) => s.map((x) => (Number(x.id) === Number(c.id) ? { ...x, name: e.target.value } : x)))}
 />
 </div>
 <div className="sm:col-span-3">
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">Fee (IQD)</label>
 <input
 className="admin-shell-input"
 type="number"
 step="1"
 value={c.fee ?? ''}
 onChange={(e) => setDeliveryCities((s) => s.map((x) => (Number(x.id) === Number(c.id) ? { ...x, fee: e.target.value } : x)))}
 />
 </div>
 <div className="sm:col-span-2 flex items-end">
 <label className="flex h-11 w-full items-center justify-between rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 px-4 text-sm font-medium text-[#4BB7D8]">
 <span>Active</span>
 <input
 type="checkbox"
 checked={Number(c.is_active ?? 1) === 1}
 onChange={(e) => setDeliveryCities((s) => s.map((x) => (Number(x.id) === Number(c.id) ? { ...x, is_active: e.target.checked ? 1 : 0 } : x)))}
 />
 </label>
 </div>
 </div>

 <div className="mt-4 flex flex-wrap justify-end gap-3">
 <AdminButton variant="danger" onClick={() => deleteDeliveryCity(c.id)}>
 Delete
 </AdminButton>
 <AdminButton
 variant="primary"
 onClick={() =>
 updateDeliveryCity(c.id, {
 city_key: c.city_key,
 name: c.name,
 fee: Number(c.fee || 0),
 is_active: Number(c.is_active ?? 1),
 })
 }
 >
 Save
 </AdminButton>
 </div>
 </div>
 ))
 )}
 </section>

 <section className="admin-shell-panel p-5">
 <div className="mb-4">
 <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/70">Create City</div>
 <h3 className="mt-1 text-base font-semibold text-[#1F2A5A]">Add Delivery City</h3>
 </div>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
 <div className="sm:col-span-3">
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">Key</label>
 <input
 className="admin-shell-input"
 value={newCity.city_key}
 onChange={(e) => setNewCity((s) => ({ ...s, city_key: e.target.value }))}
 />
 </div>
 <div className="sm:col-span-5">
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">Name</label>
 <input
 className="admin-shell-input"
 value={newCity.name}
 onChange={(e) => setNewCity((s) => ({ ...s, name: e.target.value }))}
 />
 </div>
 <div className="sm:col-span-2">
 <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">Fee</label>
 <input
 className="admin-shell-input"
 type="number"
 step="1"
 value={newCity.fee}
 onChange={(e) => setNewCity((s) => ({ ...s, fee: e.target.value }))}
 />
 </div>
 <div className="sm:col-span-2 flex items-end">
 <label className="flex h-11 w-full items-center justify-between rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 px-4 text-sm font-medium text-[#4BB7D8]">
 <span>Active</span>
 <input
 type="checkbox"
 checked={Number(newCity.is_active) === 1}
 onChange={(e) => setNewCity((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))}
 />
 </label>
 </div>
 </div>

 <div className="mt-4 flex justify-end">
 <AdminButton variant="primary" onClick={createDeliveryCity}>
 Add City
 </AdminButton>
 </div>
 </section>
 </div>
 </AdminDrawer>
 </div>
 );
}
