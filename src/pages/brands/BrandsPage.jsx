import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { useToast } from '../../store/toast';
import AdminButton from '../../components/ui/AdminButton';
import AdminDrawer from '../../components/ui/AdminDrawer';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;

const INITIAL_STATE = {
 id: null,
 name: '',
 slug: '',
 image: '',
 imageFile: null,
 is_active: 1,
};

// ─── Icons ───────────────────────────────────────────────────────
function IconTag() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>);
}
function IconPlus() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>);
}
function IconEdit() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>);
}
function IconTrash() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
}
function IconX() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
}
function IconFilter() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
}
function IconChevronLeft() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>);
}
function IconChevronRight() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>);
}
function IconUploadCloud() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>);
}
function IconLink() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>);
}
function IconCheck() {
 return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}

export default function BrandsPage() {
 const { add } = useToast();

 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);

 const [page, setPage] = useState(1);
 const [per, setPer] = useState(20);
 const [activeFilter, setActiveFilter] = useState('');

 const [modalOpen, setModalOpen] = useState(false);
 const [modalMode, setModalMode] = useState('create');
 const [formData, setFormData] = useState(INITIAL_STATE);
 const [submitting, setSubmitting] = useState(false);
 const [imagePreview, setImagePreview] = useState(null);
 const [dragOver, setDragOver] = useState(false);

 const [viewMode, setViewMode] = useState('table');

 const fetchList = useCallback(async () => {
 setLoading(true);
 try {
 const params = new URLSearchParams();
 params.set('page', String(page));
 params.set('per_page', String(per));
 if (activeFilter !== '') params.set('active', activeFilter);
 const res = await api.get(`/api/brands?${params.toString()}`);
 setItems(res.data || res);
 } catch (e) {
 add(e.message, 'error');
 } finally {
 setLoading(false);
 }
 }, [page, per, activeFilter, add]);

 useEffect(() => { fetchList(); }, [fetchList]);

 function openCreate() {
 setModalMode('create');
 setFormData(INITIAL_STATE);
 setImagePreview(null);
 setModalOpen(true);
 }

 function openEdit(brand) {
 setModalMode('edit');
 setFormData({
 id: brand.id,
 name: brand.name,
 slug: brand.slug || '',
 image: brand.image || '',
 imageFile: null,
 is_active: brand.is_active ? 1 : 0,
 });
 setImagePreview(brand.image ? `${ASSET_BASE}/${brand.image}` : null);
 setModalOpen(true);
 }

 function handleFileSelect(file) {
 if (!file) return;
 setFormData((prev) => ({ ...prev, imageFile: file }));
 const reader = new FileReader();
 reader.onload = (e) => setImagePreview(e.target.result);
 reader.readAsDataURL(file);
 }

 async function handleSubmit(e) {
 e.preventDefault();
 setSubmitting(true);
 try {
 const payload = {
 name: formData.name,
 slug: formData.slug || undefined,
 is_active: Number(formData.is_active),
 };
 let brandId = formData.id;
 if (modalMode === 'create') {
 const res = await api.post('/api/brands', payload);
 brandId = res.id || res.data?.id;
 add('Brand created', 'success');
 } else {
 await api.patch(`/api/brands?id=${brandId}`, payload);
 add('Brand updated', 'success');
 }
 if (formData.imageFile && brandId) {
 const fd = new FormData();
 fd.append('image', formData.imageFile);
 await api.postForm(`/api/brands/${brandId}/image`, fd);
 }
 setModalOpen(false);
 fetchList();
 } catch (e) {
 add(e.message, 'error');
 } finally {
 setSubmitting(false);
 }
 }

 async function deleteBrand(id) {
 try {
 await api.del(`/api/brands?id=${id}`);
 fetchList();
 add('Brand deleted', 'success');
 } catch (e) {
 add(e.message, 'error');
 }
 }

 const activeCount = items.filter((b) => b.is_active).length;
 const inactiveCount = items.length - activeCount;

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

 {/* ─── Header ─────────────────────────────────────────── */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="relative">
 <div className="p-3 rounded-2xl bg-[#4BB7D8]/10 text-[#4BB7D8] border border-[#4BB7D8]/20">
 <IconTag />
 </div>
 <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white flex items-center justify-center">
 <span className="text-[9px] font-bold text-[#1F2A5A]">{items.length}</span>
 </div>
 </div>
 <div>
 <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
 Brands
 </h1>
 <div className="flex items-center gap-3 mt-0.5">
 <span className="flex items-center gap-1 text-xs text-accent font-medium">
 <span className="w-1.5 h-1.5 rounded-full bg-accent" />
 {activeCount} active
 </span>
 {inactiveCount > 0 && (
 <span className="flex items-center gap-1 text-xs text-muted font-medium">
 <span className="w-1.5 h-1.5 rounded-full bg-muted" />
 {inactiveCount} inactive
 </span>
 )}
 </div>
 </div>
 </div>
 <AdminButton onClick={openCreate} variant="primary" size="lg" leftIcon={<IconPlus />}>
 Add Brand
 </AdminButton>
 </div>

 {/* ─── Filter Bar ─────────────────────────────────────── */}
 <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 ">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3 flex-wrap">
 <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
 <IconFilter />
 </div>

 {/* Status Tabs */}
 <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1">
 {[
 { value: '', label: 'All', count: items.length },
 { value: '1', label: 'Active', count: activeCount },
 { value: '0', label: 'Inactive', count: inactiveCount },
 ].map((opt) => (
 <button
 key={opt.value}
 onClick={() => { setActiveFilter(opt.value); setPage(1); }}
 className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
 activeFilter === opt.value
 ? 'bg-white text-primary ring-1 ring-primary/10'
 : 'text-muted hover:text-slate-700 hover:bg-white/50'
 }`}
 >
 {opt.label}
 <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
 activeFilter === opt.value ? 'bg-primary/10 text-primary' : 'bg-slate-200/60 text-muted'
 }`}>
 {opt.count}
 </span>
 </button>
 ))}
 </div>
 </div>

 <div className="flex items-center gap-3">
 {/* View Mode */}
 <div className="flex gap-1 bg-slate-100/80 rounded-lg p-0.5">
 <button
 onClick={() => setViewMode('grid')}
 className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-primary' : 'text-muted hover:text-[#1F2A5A]/70'}`}
 title="Grid"
 >
 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
 </button>
 <button
 onClick={() => setViewMode('table')}
 className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white text-primary' : 'text-muted hover:text-[#1F2A5A]/70'}`}
 title="Table"
 >
 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
 </button>
 </div>

 <div className="w-px h-6 bg-slate-200" />

 <div className="flex items-center gap-1.5">
 <span className="text-[10px] uppercase tracking-wider font-bold text-muted">Rows</span>
 <div className="flex gap-0.5 bg-slate-100/80 rounded-lg p-0.5">
 {[10, 20, 50].map((n) => (
 <button
 key={n}
 onClick={() => { setPer(n); setPage(1); }}
 className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
 per === n ? 'bg-white text-primary' : 'text-muted hover:text-[#1F2A5A]/70'
 }`}
 >
 {n}
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* ─── Content ────────────────────────────────────────── */}
 <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 overflow-hidden">
 {loading ? (
 <div className="p-20 flex flex-col items-center gap-4">
 <div className="relative w-14 h-14">
 <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
 <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
 <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
 </div>
 <p className="text-sm text-muted animate-pulse font-medium">Loading brands...</p>
 </div>
 ) : items.length === 0 ? (
 <div className="p-20 flex flex-col items-center gap-4">
 <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary/30">
 <IconTag />
 </div>
 <div className="text-center">
 <p className="font-bold text-[#1F2A5A]/70 text-lg">No brands yet</p>
 <p className="text-sm text-muted mt-1">Add your first brand to get started</p>
 </div>
 <AdminButton onClick={openCreate} variant="primary" leftIcon={<IconPlus />}>
 Create First Brand
 </AdminButton>
 </div>
 ) : viewMode === 'grid' ? (
 /* ─── Grid View ─────────────────────────────────── */
 <div className="p-5">
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
 {items.map((b, idx) => (
 <div
 key={b.id}
 className="group relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden hover:-y-1 transition-all duration-300"
 style={{ animationDelay: `${idx * 40}ms` }}
 >
 {/* Logo Area */}
 <div className="relative aspect-square bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center p-6 overflow-hidden">
 {b.image ? (
 <img
 src={`${ASSET_BASE}/${b.image}`}
 alt={b.name}
 className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
 onError={(e) => (e.target.style.display = 'none')}
 />
 ) : (
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
 <span className="text-2xl font-extrabold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
 {b.name?.charAt(0)?.toUpperCase()}
 </span>
 </div>
 )}

 {/* Status */}
 <div className="absolute top-2.5 left-2.5">
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
 b.is_active ? 'bg-accent/90 text-[#1F2A5A]' : 'bg-slate-800/70 text-[#1F2A5A]'
 }`}>
 <span className={`w-1 h-1 rounded-full ${b.is_active ? 'bg-white' : 'bg-slate-400'}`} />
 {b.is_active ? 'Active' : 'Off'}
 </span>
 </div>

 {/* Always Visible Actions */}
 <div className="absolute top-2.5 right-2.5 flex gap-1">
 <button
 onClick={(e) => { e.stopPropagation(); openEdit(b); }}
 className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-primary hover:bg-primary hover:text-[#1F2A5A] transition-all duration-200 hover:scale-110"
 title="Edit"
 >
 <IconEdit />
 </button>
 <button
 onClick={(e) => { e.stopPropagation(); deleteBrand(b.id); }}
 className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-[#1F2A5A] -red-500/20 transition-all duration-200 hover:scale-110"
 title="Delete"
 >
 <IconTrash />
 </button>
 </div>
 </div>

 {/* Info */}
 <div className="p-3.5 border-t border-slate-100">
 <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors truncate text-center">
 {b.name}
 </h3>
 {b.slug && (
 <div className="flex items-center justify-center gap-1 mt-1 text-muted">
 <IconLink />
 <span className="text-[10px] font-mono truncate">{b.slug}</span>
 </div>
 )}
 </div>

 {/* Bottom accent */}
 <div className="h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
 </div>
 ))}
 </div>
 </div>
 ) : (
 /* ─── Table View ────────────────────────────────── */
 <div className="overflow-x-auto">
 <table className="min-w-full">
 <thead>
 <tr className="bg-gradient-to-r from-primary/5 to-secondary/5">
 <th className="px-6 py-4 text-left text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest w-20">Logo</th>
 <th className="px-6 py-4 text-left text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest">Brand</th>
 <th className="px-6 py-4 text-left text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest">Slug</th>
 <th className="px-6 py-4 text-left text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest w-28">Status</th>
 <th className="px-6 py-4 text-right text-[10px] font-bold text-[#1F2A5A]/50 uppercase tracking-widest w-36">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100/80">
 {items.map((b, idx) => (
 <tr
 key={b.id}
 className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
 style={{ animationDelay: `${idx * 30}ms` }}
 >
 {/* Logo */}
 <td className="px-6 py-3.5">
 <div className="h-12 w-12 rounded-xl border-2 border-slate-200/60 bg-gradient-to-br from-slate-50 to-primary/5 flex items-center justify-center overflow-hidden group-hover:border-primary/30 group-hover: group-hover:-primary/10 transition-all duration-300">
 {b.image ? (
 <img
 src={`${ASSET_BASE}/${b.image}`}
 alt={b.name}
 className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
 onError={(e) => (e.target.style.display = 'none')}
 />
 ) : (
 <span className="text-lg font-extrabold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
 {b.name?.charAt(0)?.toUpperCase()}
 </span>
 )}
 </div>
 </td>

 {/* Name */}
 <td className="px-6 py-3.5">
 <span className="font-bold text-slate-800 group-hover:text-primary transition-colors duration-200">
 {b.name}
 </span>
 </td>

 {/* Slug */}
 <td className="px-6 py-3.5">
 {b.slug ? (
 <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100/80 text-[#1F2A5A]/50 border border-slate-200/50">
 <IconLink />{b.slug}
 </span>
 ) : (
 <span className="text-xs text-[#1F2A5A]/80">—</span>
 )}
 </td>

 {/* Status */}
 <td className="px-6 py-3.5">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
 b.is_active
 ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60 -emerald-100'
 : 'bg-slate-100 text-[#1F2A5A]/50 border border-slate-200/60'
 }`}>
 {b.is_active ? (
 <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[#1F2A5A]"><IconCheck /></span>
 ) : (
 <span className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-[#1F2A5A]"><IconX /></span>
 )}
 {b.is_active ? 'Active' : 'Inactive'}
 </span>
 </td>

 {/* Actions — Always Visible */}
 <td className="px-6 py-3.5 text-right">
 <div className="flex justify-end gap-1.5">
 <button
 onClick={() => openEdit(b)}
 className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-[#1F2A5A] hover: transition-all duration-200 hover:scale-110"
 title="Edit"
 >
 <IconEdit />
 </button>
 <button
 onClick={() => deleteBrand(b.id)}
 className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-[#1F2A5A] -red-500/10 hover:-500/20 transition-all duration-200 hover:scale-110"
 title="Delete"
 >
 <IconTrash />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Pagination */}
 {items.length > 0 && (
 <div className="px-6 py-4 border-t border-slate-100/80 bg-gradient-to-r from-primary/5 to-secondary/5 flex items-center justify-between">
 <button
 disabled={page <= 1}
 onClick={() => setPage((p) => p - 1)}
 className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#1F2A5A]/70 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-x-0.5"
 >
 <IconChevronLeft /> Previous
 </button>
 <div className="flex items-center gap-3">
 <span className="text-sm text-[#1F2A5A]/50">
 Page <span className="font-extrabold text-primary">{page}</span>
 </span>
 <span className="text-xs text-[#1F2A5A]/80">•</span>
 <span className="text-xs text-muted">{items.length} brand{items.length !== 1 ? 's' : ''}</span>
 </div>
 <button
 onClick={() => setPage((p) => p + 1)}
 disabled={items.length < per}
 className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#1F2A5A]/70 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover: hover:translate-x-0.5"
 >
 Next <IconChevronRight />
 </button>
 </div>
 )}
 </div>

 <AdminDrawer
 open={modalOpen}
 onClose={() => !submitting && setModalOpen(false)}
 size="lg"
 eyebrow={modalMode === 'create' ? 'Create Brand' : 'Update Brand'}
 title={modalMode === 'create' ? 'New Brand' : 'Edit Brand'}
 subtitle={modalMode === 'create' ? 'Add a new brand to your catalog.' : `Updating: ${formData.name || 'Selected brand'}`}
 footer={
 <div className="flex justify-end gap-3">
 <AdminButton variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
 Cancel
 </AdminButton>
 <AdminButton type="submit" form="brandForm" variant="primary" disabled={submitting}>
 {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Brand' : 'Save Changes'}
 </AdminButton>
 </div>
 }
 >
 <form id="brandForm" onSubmit={handleSubmit} className="space-y-6">
 <section
 className={`admin-shell-panel relative overflow-hidden border-2 border-dashed p-0 transition-all duration-300 ${
 dragOver
 ? 'border-amber-300/50 bg-amber-300/5'
 : 'border-slate-700/80 hover:border-amber-300/30'
 }`}
 onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
 onDragLeave={() => setDragOver(false)}
 onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
 onClick={() => document.getElementById('brand-image-input').click()}
 >
 <input
 id="brand-image-input"
 type="file"
 accept="image/*"
 className="hidden"
 onChange={(e) => handleFileSelect(e.target.files?.[0])}
 />
 {imagePreview ? (
 <div className="relative group flex items-center justify-center bg-slate-950/50 py-8">
 <div className="h-32 w-32 overflow-hidden rounded-[28px] border border-slate-700 bg-white p-3">
 <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
 </div>
 <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-all duration-300 group-hover:opacity-100">
 <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#1F2A5A] backdrop-blur">
 Change Logo
 </div>
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
 <div className="text-amber-300/70"><IconUploadCloud /></div>
 <div>
 <p className="text-sm font-semibold text-[#1F2A5A]">
 Drop logo here or <span className="text-amber-300 underline underline-offset-2">browse</span>
 </p>
 <p className="mt-1 text-[11px] text-[#1F2A5A]/50">PNG, JPG, SVG</p>
 </div>
 </div>
 )}
 </section>

 <section className="admin-shell-panel space-y-5 p-5">
 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">
 Brand Name <span className="text-red-400">*</span>
 </label>
 <input
 className="admin-shell-input"
 placeholder="e.g. Nike"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 required
 autoFocus
 />
 </div>

 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#1F2A5A]/50">
 <IconLink /> Slug <span className="normal-case tracking-normal text-[#1F2A5A]/70">(auto if empty)</span>
 </label>
 <input
 className="admin-shell-input font-mono"
 placeholder="nike"
 value={formData.slug}
 onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
 />
 </div>

 <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
 <label className="flex items-center justify-between gap-4 text-sm text-[#1F2A5A]/80">
 <div>
 <div className="font-semibold text-[#1F2A5A]">{formData.is_active ? 'Active' : 'Inactive'}</div>
 <p className="mt-1 text-xs text-[#1F2A5A]/50">
 {formData.is_active
 ? 'This brand is visible and products can be assigned to it.'
 : 'This brand is hidden from the storefront.'}
 </p>
 </div>
 <input
 type="checkbox"
 checked={!!formData.is_active}
 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
 />
 </label>
 </div>
 </section>
 </form>
 </AdminDrawer>
 </div>
 </div>
 );
}
