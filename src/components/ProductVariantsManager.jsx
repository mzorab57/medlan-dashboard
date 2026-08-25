import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, API_BASE } from '../lib/api';
import { useToast } from '../store/toast';
import { useAuth } from '../store/auth';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;
function assetUrl(p) {
 const rel = String(p || '').replace(/^\/+/, '');
 return `${ASSET_BASE}/${rel}`;
}

const IMAGE_PROCESS_THRESHOLD_BYTES = 1024 * 1024; // 1MB
const IMAGE_TARGET_BYTES = 900 * 1024; // 900KB
const IMAGE_MAX_DIMENSION = 2600;
const IMAGE_MIN_DIMENSION = 1400;
const IMAGE_START_QUALITY = 0.98;
const IMAGE_MIN_QUALITY = 0.88;
const IMAGE_QUALITY_STEP = 0.02;
const IMAGE_SCALE_STEP = 0.97;
const SUPPORTED_IMAGE_TYPES = new Set([
 'image/jpeg',
 'image/png',
 'image/webp',
]);
function renameWithWebp(name) {
 return String(name || 'image').replace(/\.[^.]+$/, '') + '.webp';
}

function readImageFile(file) {
 return new Promise((resolve, reject) => {
 const url = URL.createObjectURL(file);
 const img = new Image();
 img.onload = () => {
 URL.revokeObjectURL(url);
 resolve(img);
 };
 img.onerror = () => {
 URL.revokeObjectURL(url);
 reject(new Error('Image file could not be read'));
 };
 img.src = url;
 });
}

function canvasToBlob(canvas, type, quality) {
 return new Promise((resolve, reject) => {
 canvas.toBlob((blob) => {
 if (blob) resolve(blob);
 else reject(new Error('Image conversion failed'));
 }, type, quality);
 });
}

async function optimizeVariantImage(file) {
 if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
 throw new Error('Only JPG, PNG, and WebP images are supported');
 }

 const shouldProcess = file.type !== 'image/webp' || file.size > IMAGE_PROCESS_THRESHOLD_BYTES;
 if (!shouldProcess) return file;

 const img = await readImageFile(file);
 const longestSide = Math.max(img.naturalWidth, img.naturalHeight);
 const baseScale = longestSide > IMAGE_MAX_DIMENSION ? IMAGE_MAX_DIMENSION / longestSide : 1;

 let bestBlob = null;
 let scale = baseScale;

 while (scale > 0) {
 const width = Math.max(1, Math.round(img.naturalWidth * scale));
 const height = Math.max(1, Math.round(img.naturalHeight * scale));
 const shortestSide = Math.min(width, height);

 const canvas = document.createElement('canvas');
 canvas.width = width;
 canvas.height = height;
 const ctx = canvas.getContext('2d', { alpha: true });
 if (!ctx) throw new Error('Canvas is not available');
 ctx.imageSmoothingEnabled = true;
 ctx.imageSmoothingQuality = 'high';
 ctx.drawImage(img, 0, 0, width, height);

 for (let quality = IMAGE_START_QUALITY; quality >= IMAGE_MIN_QUALITY; quality -= IMAGE_QUALITY_STEP) {
 const blob = await canvasToBlob(canvas, 'image/webp', Number(quality.toFixed(2)));
 if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
 if (blob.size <= IMAGE_TARGET_BYTES) {
 return new File([blob], renameWithWebp(file.name), {
 type: 'image/webp',
 lastModified: Date.now(),
 });
 }
 }

 if (shortestSide <= IMAGE_MIN_DIMENSION) break;
 scale *= IMAGE_SCALE_STEP;
 }

 if (!bestBlob) throw new Error('Image optimization failed');

 return new File([bestBlob], renameWithWebp(file.name), {
 type: 'image/webp',
 lastModified: Date.now(),
 });
}

// ─── Icons ───────────────────────────────────────────────────────
function IconPlus() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
}
function IconSave() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
}
function IconTrash() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>);
}
function IconImage() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
}
function IconUpload() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
}
function IconChevronDown() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
}
function IconChevronUp() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>);
}
function IconPalette() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>);
}
function IconRuler() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" /></svg>);
}
function IconRefresh() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>);
}
function IconPackage() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
}
function IconCheck() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconStar() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
}

export default function ProductVariantsManager({ productId, productName, specs, onReload }) {
 const { user } = useAuth();
 const isAdmin = user?.role === 'admin';
 const navigate = useNavigate();
 const [rows, setRows] = useState(specs || []);
 const [colors, setColors] = useState([]);
 const [sizes, setSizes] = useState([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [basePrice, setBasePrice] = useState(null);
 const [basePurchasePrice, setBasePurchasePrice] = useState(null);
 const [createImageFile, setCreateImageFile] = useState(null);
 const [backfilling, setBackfilling] = useState(false);
 const [showCreateForm, setShowCreateForm] = useState(false);
 const [expandedRow, setExpandedRow] = useState(null);
 const [form, setForm] = useState({
 sku_variant: '', spec_key: '', spec_value: '', price: '', purchase_price: '',
 color_id: '', size_id: '', gender: '', is_active: 1,
 });

 const { add } = useToast();

 useEffect(() => { setRows(specs || []); }, [specs]);

 async function fetchMeta() {
 try {
 const cs = await api.get('/api/colors');
 const ss = await api.get('/api/sizes');
 setColors(cs.data || cs);
 setSizes(ss.data || ss);
 } catch { void 0; }
 }

 useEffect(() => { fetchMeta(); }, []);

 useEffect(() => {
 (async () => {
 try {
 const res = await api.get(`/api/products?id=${productId}`);
 const p = res.product || res;
 setBasePrice(p?.base_price != null ? Number(p.base_price) : null);
 setBasePurchasePrice(p?.purchase_price != null ? Number(p.purchase_price) : null);
 } catch { setBasePrice(null); setBasePurchasePrice(null); }
 })();
 }, [productId]);

 const colorTotals = useMemo(() => {
 const map = {};
 rows.forEach((r) => { if (r.color_id) map[r.color_id] = (map[r.color_id] || 0) + Number(r.stock || 0); });
 return Object.entries(map).map(([id, total]) => ({ id: Number(id), total }));
 }, [rows]);

 const sizeTotals = useMemo(() => {
 const map = {};
 rows.forEach((r) => { if (r.size_id) map[r.size_id] = (map[r.size_id] || 0) + Number(r.stock || 0); });
 return Object.entries(map).map(([id, total]) => ({ id: Number(id), total }));
 }, [rows]);

 const totalStock = useMemo(() => rows.reduce((s, r) => s + Number(r.stock || 0), 0), [rows]);

 function getColorName(id) { return colors.find((x) => x.id === id)?.name || `Color ${id}`; }
 function getSizeName(id) { return sizes.find((x) => x.id === id)?.name || `Size ${id}`; }
 function getColorHex(id) { return colors.find((x) => x.id === id)?.hex_code || null; }
 function updateForm(k, v) { setForm((s) => ({ ...s, [k]: v })); }
 function openStockPage(row) {
 localStorage.setItem('stock_product_id', String(productId));
 localStorage.setItem('stock_product_name', productName || '');
 localStorage.setItem('stock_spec_id', String(row.id));
 navigate('/stock');
 }
 function openPurchasesPage() {
 navigate('/purchases');
 }

 // ─── Images ────────────────────────────────────────────────────
 const [imagesMap, setImagesMap] = useState({});
 const [openImages, setOpenImages] = useState({});
 const [uploadingMap, setUploadingMap] = useState({});

 async function loadSpecImages(specId) {
 try {
 const res = await api.get(`/api/specs/${specId}/images`);
 setImagesMap((m) => ({ ...m, [specId]: res.data?.data || res.data || res || [] }));
 } catch { setImagesMap((m) => ({ ...m, [specId]: [] })); }
 }

 function toggleVariantRow(specId, isExpanded) {
 if (isExpanded) {
 setExpandedRow(null);
 setOpenImages((prev) => ({ ...prev, [specId]: false }));
 return;
 }
 setExpandedRow(specId);
 setOpenImages((prev) => ({ ...prev, [specId]: true }));
 loadSpecImages(specId);
 }

 async function uploadSpecImage(specId, e) {
 e.preventDefault();
 const f = e.currentTarget;
 const imageInput = f.elements.namedItem('image');
 const altInput = f.elements.namedItem('alt_text');
 const sortInput = f.elements.namedItem('sort_order');
 const primaryInput = f.elements.namedItem('is_primary');
 const files = Array.from(imageInput?.files || []);
 if (files.length === 0) return;
 setUploadingMap((m) => ({ ...m, [specId]: true }));
 const altText = altInput && 'value' in altInput ? altInput.value || '' : '';
 const baseSortOrder = sortInput && 'value' in sortInput ? Number(sortInput.value || 0) : 0;
 const markFirstAsPrimary = primaryInput && 'checked' in primaryInput ? !!primaryInput.checked : false;
 let uploadedCount = 0;
 try {
 for (const [index, file] of files.entries()) {
 const preparedFile = await optimizeVariantImage(file);
 const fd = new FormData();
 fd.append('image', preparedFile, preparedFile.name);
 fd.append('alt_text', altText);
 fd.append('sort_order', String(baseSortOrder + index));
 fd.append('is_primary', markFirstAsPrimary && index === 0 ? '1' : '0');
 await api.postForm(`/api/specs/${specId}/images`, fd);
 uploadedCount += 1;
 }
 await loadSpecImages(specId);
 f.reset();
 add(
 uploadedCount === 1
 ? 'Image uploaded'
 : `${uploadedCount} images uploaded`,
 'success',
 );
 } catch (e) { add(e.message, 'error'); }
 finally { setUploadingMap((m) => ({ ...m, [specId]: false })); }
 }

 async function deleteSpecImage(imageId, specId) {
 try {
 await api.del(`/api/spec-images?id=${imageId}`);
 await loadSpecImages(specId);
 add('Image deleted', 'success');
 } catch (e) { add(e.message, 'error'); }
 }

 async function setPrimarySpecImage(imageId, specId) {
 try {
 await api.patch(`/api/spec-images?id=${imageId}`, {});
 await loadSpecImages(specId);
 add('Primary set', 'success');
 } catch (e) { add(e.message, 'error'); }
 }

 // ─── CRUD ──────────────────────────────────────────────────────
 async function createVariant(e) {
 e.preventDefault();
 setLoading(true);
 setError(null);
 const payload = {
 sku_variant: form.sku_variant || undefined,
 spec_key: form.spec_key || undefined,
 spec_value: form.spec_value || undefined,
 price: form.price !== '' ? Number(form.price) : Number(basePrice || 0),
 purchase_price: isAdmin ? (form.purchase_price !== '' ? Number(form.purchase_price) : (basePurchasePrice != null ? Number(basePurchasePrice) : undefined)) : undefined,
 stock: 0,
 gender: form.gender || undefined,
 color_id: form.color_id ? Number(form.color_id) : undefined,
 size_id: form.size_id ? Number(form.size_id) : undefined,
 is_active: Number(form.is_active),
 };
 try {
 const resp = await api.post(`/api/products/${productId}/specs`, payload);
 console.log(resp);
 const newId = resp?.id || resp?.data?.id;
 if (newId && createImageFile) {
 const preparedFile = await optimizeVariantImage(createImageFile);
 const fd = new FormData();
 fd.append('image', preparedFile, preparedFile.name);
 fd.append('is_primary', '0');
 const createdImage = await api.postForm(`/api/specs/${newId}/images`, fd);
 if (createdImage?.image) {
 setImagesMap((m) => ({ ...m, [newId]: [...(m[newId] || []), { id: createdImage.id, spec_id: newId, image: createdImage.image }] }));
 }
 }
 if (onReload) await onReload();
 if (newId) setOpenImages((prev) => ({ ...prev, [newId]: true }));
 setForm({ sku_variant: '', spec_key: '', spec_value: '', price: '', purchase_price: '', color_id: '', size_id: '', gender: '', is_active: 1 });
 setCreateImageFile(null);
 setShowCreateForm(false);
 add('Variant created', 'success');
 } catch (e) { setError(e.message); add(e.message, 'error'); }
 finally { setLoading(false); }
 }

 async function backfillPurchasePrices() {
 setBackfilling(true);
 try {
 const res = await api.patch(`/api/products/backfill-variant-purchase?id=${productId}`, {});
 add(`Updated ${Number(res?.updated ?? 0).toLocaleString()} variants`, 'success');
 if (onReload) await onReload();
 } catch (e) { add(e.message, 'error'); }
 finally { setBackfilling(false); }
 }

 async function saveRow(r) {
 const patch = {};
 if (r.sku_variant?.trim()) patch.sku_variant = r.sku_variant.trim();
 if (r.spec_key?.trim()) patch.spec_key = r.spec_key.trim();
 if (r.spec_value?.trim()) patch.spec_value = r.spec_value.trim();
 if (r.price != null && String(r.price) !== '') patch.price = Number(r.price);
 if (isAdmin && r.purchase_price != null && String(r.purchase_price) !== '') patch.purchase_price = Number(r.purchase_price);
 if (r.gender !== undefined) patch.gender = r.gender;
 if (r.color_id) patch.color_id = Number(r.color_id);
 if (r.size_id) patch.size_id = Number(r.size_id);
 patch.is_active = Number(r.is_active ? 1 : 0);
 try {
 await api.patch(`/api/specs?id=${r.id}`, patch);
 if (onReload) await onReload();
 add('Variant updated', 'success');
 } catch (e) { setError(e.message); add(e.message, 'error'); }
 }

 async function deleteRow(id) {
 try {
 await api.del(`/api/specs?id=${id}`);
 if (onReload) await onReload();
 add('Variant deleted', 'success');
 } catch (e) { add(e.message, 'error'); }
 }

 // ─── Render ────────────────────────────────────────────────────
 return (
 <div className="space-y-6">
 {/* ─── Header Bar ───────────────────────────────────────── */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="p-2.5 rounded-2xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8]">
 <IconPackage />
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-800">Variants</h3>
 <p className="text-xs text-[#1F2A5A]/60">{rows.length} variant{rows.length !== 1 ? 's' : ''} • {totalStock.toLocaleString()} total stock</p>
 </div>
 </div>
 <div className="flex gap-2">
 {isAdmin ? (
 <button
 type="button"
 disabled={backfilling}
 onClick={backfillPurchasePrices}
 className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-[#1F2A5A]/70 hover:bg-slate-50 hover: disabled:opacity-50 transition-all"
 >
 <IconRefresh />
 {backfilling ? 'Filling...' : 'Backfill Prices'}
 </button>
 ) : null}
 <button
 onClick={() => setShowCreateForm(!showCreateForm)}
 className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
 showCreateForm
 ? 'bg-slate-200 text-slate-700 -none'
 : 'border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40'
 }`}
 >
 <IconPlus />
 {showCreateForm ? 'Cancel' : 'Add Variant'}
 </button>
 </div>
 </div>

 {/* ─── Summary Cards ────────────────────────────────────── */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Color Stock */}
 <div className="rounded-2xl bg-white border border-slate-200/60 p-5 hover: transition-">
 <div className="flex items-center gap-2 mb-4">
 <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
 <IconPalette />
 </div>
 <span className="text-sm font-semibold text-slate-700">Stock by Color</span>
 </div>
 {colorTotals.length ? (
 <div className=" flex justify-between items-center gap-2 flex-wrap">
 {colorTotals.map((ct) => {
 const pct = totalStock > 0 ? (ct.total / totalStock) * 100 : 0;
 const hex = getColorHex(ct.id);
 return (
 <div key={ct.id}>
 <div className="flex flex-col items-center mb-1">
 <div className="flex items-center gap-2">
 {hex && (
 <span
 className="w-3.5 h-3.5 rounded-full border border-slate-200 "
 style={{ backgroundColor: hex }}
 />
 )}
 <span className="text-sm text-[#1F2A5A]/70">{getColorName(ct.id)}</span>
 </div>
 <span className="text-sm font-bold text-slate-800 font-mono">{ct.total.toLocaleString()}</span>
 </div>
 
 </div>
 );
 })}
 </div>
 ) : (
 <p className="text-sm text-[#1F2A5A]/60 text-center py-4">No color data</p>
 )}
 </div>

 {/* Size Stock */}
 <div className="rounded-2xl bg-white border border-slate-200/60 p-5 hover: transition-">
 <div className="flex items-center gap-2 mb-4">
 <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
 <IconRuler />
 </div>
 <span className="text-sm font-semibold text-slate-700">Stock by Size</span>
 </div>
 {sizeTotals.length ? (
 <div className="flex flex-wrap gap-2">
 {sizeTotals.map((st) => (
 <div
 key={st.id}
 className="flex flex-col items-center px-2 py-1 rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50 border-blue-200/50 min-w-[70px] hover: transition-"
 >
 <span className="text-xs font-bold text-blue-700 uppercase">{getSizeName(st.id)}</span>
 <span className="text-xs font-bold text-slate-800 font-mono mt-0.5">{st.total.toLocaleString()}</span>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-[#1F2A5A]/60 text-center py-4">No size data</p>
 )}
 </div>
 </div>

 {/* ─── Create Form ──────────────────────────────────────── */}
 {showCreateForm && (
 <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 border-2 border-dashed border-violet-200 p-6 ">
 <div className="flex items-center gap-2 mb-5">
 <div className="p-1.5 rounded-lg bg-violet-100 text-violet-600">
 <IconPlus />
 </div>
 <span className="text-sm font-bold text-violet-800">New Variant</span>
 </div>
 <form onSubmit={createVariant} className="space-y-4">
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 {/* SKU */}
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">SKU Variant</label>
 <input
 className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
 placeholder="SKU-001"
 value={form.sku_variant}
 onChange={(e) => updateForm('sku_variant', e.target.value)}
 />
 </div>
 {/* Color */}
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Color</label>
 <select
 className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all appearance-none cursor-pointer"
 value={form.color_id}
 onChange={(e) => updateForm('color_id', e.target.value)}
 >
 <option value="">Select color</option>
 {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 {/* Size */}
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Size</label>
 <select
 className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all appearance-none cursor-pointer"
 value={form.size_id}
 onChange={(e) => updateForm('size_id', e.target.value)}
 >
 <option value="">Select size</option>
 {sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 </div>
 {/* Gender */}
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Gender</label>
 <select
 className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all appearance-none cursor-pointer"
 value={form.gender}
 onChange={(e) => updateForm('gender', e.target.value)}
 >
 <option value="">Any</option>
 <option value="male">Male</option>
 <option value="female">Female</option>
 </select>
 </div>
 </div>

 {/* Bottom Row: Image + Active + Submit */}
 <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 pt-2">
 <div className="flex-1">
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Image</label>
 <input
 type="file"
 accept="image/jpeg,image/png,image/webp"
 className="w-full text-sm border border-slate-200 rounded-xl bg-white p-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-600 hover:file:bg-violet-100 cursor-pointer"
 onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
 />
 </div>

 <label className="relative inline-flex items-center gap-3 cursor-pointer pb-1">
 <div className="relative">
 <input
 type="checkbox"
 className="sr-only peer"
 checked={!!form.is_active}
 onChange={(e) => updateForm('is_active', e.target.checked ? 1 : 0)}
 />
 <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after: after:transition-all peer-checked:bg-emerald-500 transition-colors" />
 </div>
 <span className="text-sm font-medium text-[#1F2A5A]/70">Active</span>
 </label>

 <button
 disabled={loading}
 type="submit"
 className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-[#1F2A5A] text-sm font-semibold -violet-500/25 hover:-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 <IconPlus />
 {loading ? 'Creating...' : 'Create Variant'}
 </button>
 </div>
 </form>
 </div>
 )}

 {error && (
 <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-red-500" />
 {error}
 </div>
 )}

 {/* ─── Variants List ────────────────────────────────────── */}
 {rows.length === 0 ? (
 <div className="rounded-2xl bg-white border border-slate-200/60 p-12 text-center ">
 <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-[#1F2A5A]/80">
 <IconPackage />
 </div>
 <p className="font-semibold text-[#1F2A5A]/50">No variants yet</p>
 <p className="text-sm text-[#1F2A5A]/60 mt-1">Create your first variant above</p>
 </div>
 ) : (
 <div className="space-y-3">
 {rows.map((r, idx) => {
 const isExpanded = expandedRow === r.id;
 const colorHex = getColorHex(r.color_id);
 const stockNum = Number(r.stock || 0);
 const isLowStock = stockNum > 0 && stockNum < 10;
 const isOutOfStock = stockNum === 0;

 return (
 <div
 key={r.id}
 className={`rounded-2xl bg-white border overflow-hidden transition-all duration-300 ${
 isExpanded ? 'border-violet-300 -violet-100' : 'border-slate-200/60 hover: hover:border-slate-300'
 }`}
 style={{ animationDelay: `${idx * 40}ms` }}
 >
 {/* ─── Variant Header Row ────────────────────── */}
 <div
 className="flex items-center gap-4 px-5 py-4 cursor-pointer group"
 onClick={() => toggleVariantRow(r.id, isExpanded)}
 >
 {/* Color Dot + ID */}
 <div className="flex items-center gap-2.5 min-w-[60px]">
 {colorHex ? (
 <span className="w-4 h-4 rounded-full border-2 border-white " style={{ backgroundColor: colorHex }} />
 ) : (
 <span className="w-4 h-4 rounded-full bg-slate-200" />
 )}
 <span className="text-xs font-bold text-[#1F2A5A]/60">#{r.id}</span>
 </div>

 {/* Main Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 {r.sku_variant && (
 <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-[#1F2A5A]/70 font-bold">{r.sku_variant}</span>
 )}
 {r.color_id && (
 <span className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-medium border border-pink-200/50">
 {getColorName(r.color_id)}
 </span>
 )}
 {r.size_id && (
 <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200/50">
 {getSizeName(r.size_id)}
 </span>
 )}
 {r.gender && (
 <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-200/50 capitalize">
 {r.gender}
 </span>
 )}
 {r.spec_key && r.spec_value && (
 <span className="text-xs text-[#1F2A5A]/50">{r.spec_key}: <strong>{r.spec_value}</strong></span>
 )}
 </div>
 </div>

 {/* Price & Stock */}
 <div className="hidden sm:flex items-center gap-5">
 <div className="text-right">
 <div className="text-sm font-bold text-emerald-700">{Number(r.price).toLocaleString()} <span className="text-[10px] text-[#1F2A5A]/60">IQD</span></div>
 {isAdmin && r.purchase_price != null && (
 <div className="text-[10px] text-[#1F2A5A]/60">Cost: {Number(r.purchase_price).toLocaleString()}</div>
 )}
 </div>
 <div className="text-center min-w-[60px]">
 <div className={`text-sm font-bold font-mono ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
 {stockNum.toLocaleString()}
 </div>
 {isOutOfStock && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">OUT</span>}
 {isLowStock && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold">LOW</span>}
 </div>
 </div>

 {/* Status & Toggle */}
 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${r.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-[#1F2A5A]/50 border border-slate-200'}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
 {r.is_active ? 'Active' : 'Off'}
 </span>
 <div className="text-[#1F2A5A]/60 group-hover:text-violet-500 transition-colors">
 {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
 </div>
 </div>
 </div>

 {/* ─── Expanded Content ─────────────────────── */}
 {isExpanded && (
 <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
 {/* Edit Fields */}
 <div className="px-5 py-5 space-y-4">
 
 
 

 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">SKU</label>
 <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" value={r.sku_variant || ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, sku_variant: e.target.value } : x))} />
 </div>
 {/* <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Spec Key</label>
 <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" value={r.spec_key || ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, spec_key: e.target.value } : x))} />
 </div> */}
 {/* <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Spec Value</label>
 <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400" value={r.spec_value || ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, spec_value: e.target.value } : x))} />
 </div> */}
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Gender</label>
 <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none cursor-pointer" value={r.gender ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, gender: e.target.value } : x))}>
 <option value="">—</option>
 <option value="male">Male</option>
 <option value="female">Female</option>
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Sell Price</label>
 <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono" type="number" step="0.01" value={r.price} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, price: e.target.value } : x))} />
 </div>
 {isAdmin ? (
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Cost Price</label>
 <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-mono" type="number" step="0.01" value={r.purchase_price ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, purchase_price: e.target.value } : x))} />
 </div>
 ) : null}
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Stock</label>
 <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-700 font-mono cursor-not-allowed" type="text" value={Number(r.stock ?? 0).toLocaleString()} readOnly />
 <p className="mt-1 text-[10px] text-[#1F2A5A]/60">Restock from Purchases. Lost or damaged items from Stock page.</p>
 </div>
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Color</label>
 <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none cursor-pointer" value={r.color_id ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, color_id: e.target.value } : x))}>
 <option value="">—</option>
 {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider mb-1">Size</label>
 <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 appearance-none cursor-pointer" value={r.size_id ?? ''} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, size_id: e.target.value } : x))}>
 <option value="">—</option>
 {sizes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
 </select>
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between pt-2 border-t border-slate-100">
 <label className="relative inline-flex items-center gap-3 cursor-pointer">
 <div className="relative">
 <input type="checkbox" className="sr-only peer" checked={!!r.is_active} onChange={(e) => setRows((s) => s.map((x) => x.id === r.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))} />
 <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after: after:transition-all peer-checked:bg-emerald-500 transition-colors" />
 </div>
 <span className="text-sm font-medium text-[#1F2A5A]/70">Active</span>
 </label>

 <div className="flex gap-2 flex-wrap justify-end">
 <button
 onClick={() => openStockPage(r)}
 className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-all"
 >
 <IconRefresh />
 Adjust Stock
 </button>
 <button
 onClick={openPurchasesPage}
 className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition-all"
 >
 <IconPackage />
 Purchases
 </button>
 {/* <button
 onClick={() => {
 const willOpen = !openImages[r.id];
 setOpenImages((prev) => ({ ...prev, [r.id]: willOpen }));
 if (willOpen) loadSpecImages(r.id);
 }}
 className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
 openImages[r.id]
 ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
 : 'border-slate-200 text-[#1F2A5A]/70 hover:bg-slate-50'
 }`}
 >
 <IconImage />
 Images
 </button> */}
 <button
 onClick={() => saveRow(r)}
 className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40 text-sm font-semibold transition-all"
 >
 <IconSave />
 Save
 </button>
 <button
 onClick={() => deleteRow(r.id)}
 className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all"
 >
 <IconTrash />
 Delete
 </button>
 </div>
 </div>
 </div>

 {/* ─── Images Panel ───────────────────────── */}
 {openImages[r.id] && (
 <div className="px-5 pb-5 border-t border-slate-100 pt-5">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 {/* Gallery */}
 <div className="md:col-span-2">
 <div className="flex items-center gap-2 mb-3">
 <div className="p-1 rounded-lg bg-indigo-100 text-indigo-600">
 <IconImage />
 </div>
 <span className="text-sm font-semibold text-slate-700">Variant Images</span>
 <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-[#1F2A5A]/50 font-medium">
 {(imagesMap[r.id] || []).length}
 </span>
 </div>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 ">
 {(imagesMap[r.id] || []).map((img) => (
 <div key={img.id} className="group relative rounded-xl border border-slate-200 overflow-hidden aspect-square bg-slate-50 hover: transition-all duration-300">
 <img src={assetUrl(img.image)} className="w-full h-full object-cover" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
 {img.is_primary ? (
 <span className="absolute top-2 left-2 bg-gradient-to-r from-emerald-500 to-green-500 text-[#1F2A5A] text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
 <IconStar /> Primary
 </span>
 ) : null}
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-3 gap-1.5">
 {!img.is_primary && (
 <button onClick={() => setPrimarySpecImage(img.id, r.id)} className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] rounded-full hover:bg-white font-semibold text-slate-700 flex items-center gap-1 transition-all hover:scale-105">
 <IconCheck /> Set Primary
 </button>
 )}
 <button onClick={() => deleteSpecImage(img.id, r.id)} className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-[#1F2A5A] text-[10px] rounded-full hover:bg-red-600 font-semibold transition-all hover:scale-105">
 Delete
 </button>
 </div>
 </div>
 ))}
 {(!imagesMap[r.id] || imagesMap[r.id].length === 0) && (
 <div className="col-span-full flex flex-col items-center py-8 text-[#1F2A5A]/60">
 <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-2">
 <IconImage />
 </div>
 <p className="text-xs">No images yet</p>
 </div>
 )}
 </div>
 </div>

 {/* Upload */}
 <div>
 <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 hover:border-violet-300 transition-colors">
 <form onSubmit={(e) => uploadSpecImage(r.id, e)} className="space-y-3">
 <div className="flex items-center gap-2 mb-2">
 <div className="p-1 rounded-lg bg-violet-100 text-violet-600">
 <IconUpload />
 </div>
 <span className="text-xs font-bold text-[#1F2A5A]/70">Upload Image</span>
 </div>
 <div>
 <input
 type="file"
 name="image"
 multiple
 accept="image/jpeg,image/png,image/webp"
 className="w-full text-xs border border-slate-200 rounded-lg bg-white p-1.5 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-violet-600 cursor-pointer"
 required
 />
 {/* <p className="mt-1 text-[10px] text-[#1F2A5A]/60">
 Non-webp xoy ba webp degorrêt; wene gawarekanish pesh upload optimize dekrên.
 </p> */}
 </div>
 {/* <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider">Sort</label>
 <input type="number" name="sort_order" defaultValue="0" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-violet-500/20" />
 </div>
 <div className="flex items-end pb-1">
 <label className="flex items-center gap-1.5 cursor-pointer">
 <input type="checkbox" name="is_primary" className="rounded" />
 <span className="text-xs text-[#1F2A5A]/70 font-medium">Primary</span>
 </label>
 </div>
 </div> */}
 <div>
 {/* <label className="text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-wider">Alt Text</label>
 <input type="text" name="alt_text" className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-2 focus:ring-violet-500/20" placeholder="Description..." /> */}
 </div>
 <button
 disabled={!!uploadingMap[r.id]}
 type="submit"
 className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40 text-xs font-semibold transition-all disabled:opacity-50"
 >
 <IconUpload />
 {uploadingMap[r.id] ? 'Uploading...' : 'Upload Images'}
 </button>
 </form>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
}
