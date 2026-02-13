import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { useToast } from '../../store/toast';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;

const INITIAL_STATE = {
  id: null,
  name: '',
  slug: '',
  image: '',
  imageFile: null,
  display_order: 0,
  is_active: 1,
};

// ─── Icons ───────────────────────────────────────────────────────
function IconGrid() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>);
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
function IconImage() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
}
function IconUploadCloud() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>);
}
function IconMove() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconLink() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>);
}

export default function CategoriesPage() {
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

  // View mode: 'table' | 'grid'
  const [viewMode, setViewMode] = useState('table');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(per));
      if (activeFilter !== '') params.set('active', activeFilter);
      const res = await api.get(`/api/categories?${params.toString()}`);
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

  function openEdit(category) {
    setModalMode('edit');
    setFormData({
      id: category.id,
      name: category.name,
      slug: category.slug || '',
      image: category.image || '',
      imageFile: null,
      display_order: category.display_order || 0,
      is_active: category.is_active ? 1 : 0,
    });
    setImagePreview(category.image ? `${ASSET_BASE}/${category.image}` : null);
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
        display_order: Number(formData.display_order),
        is_active: Number(formData.is_active),
      };
      let categoryId = formData.id;
      if (modalMode === 'create') {
        const res = await api.post('/api/categories', payload);
        categoryId = res.id || res.data?.id;
        add('Category created successfully', 'success');
      } else {
        await api.patch(`/api/categories?id=${categoryId}`, payload);
        add('Category updated successfully', 'success');
      }
      if (formData.imageFile && categoryId) {
        const fd = new FormData();
        fd.append('image', formData.imageFile);
        await api.postForm(`/api/categories/${categoryId}/image`, fd);
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCategory(id) {
    try {
      await api.del(`/api/categories?id=${id}`);
      fetchList();
      add('Category deleted', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  const activeCount = items.filter((c) => c.is_active).length;
  const inactiveCount = items.length - activeCount;

  return (
    <div className="min-h-screen  to-primary">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary  to-secondary text-white shadow-xl shadow-secondary-500/30">
                <IconGrid />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{items.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
                Categories
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {activeCount} active
                </span>
                {inactiveCount > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    {inactiveCount} inactive
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary  to-secondary text-white font-semibold shadow-xl shadow-secondary-500/30 hover:shadow-2xl hover:shadow-secondary-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary  to-secondary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <IconPlus />
            <span>Add Category</span>
          </button>
        </div>

        {/* ─── Filter & View Bar ───────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                  <IconFilter />
                </div>
                <span className="text-sm font-semibold text-slate-600 hidden sm:inline">Status</span>
              </div>
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
                        ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200/50'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    {opt.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeFilter === opt.value ? 'bg-secondary-100 text-secondary-700' : 'bg-slate-200/60 text-slate-400'
                    }`}>
                      {opt.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: View Toggle & Per Page */}
            <div className="flex items-center gap-3">
              {/* View Mode */}
              <div className="flex gap-1 bg-slate-100/80 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Table view"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Grid view"
                >
                  <IconGrid />
                </button>
              </div>

              <div className="w-px h-6 bg-slate-200" />

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Rows</span>
                <div className="flex gap-0.5 bg-slate-100/80 rounded-lg p-0.5">
                  {[10, 20, 50].map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPer(n); setPage(1); }}
                      className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                        per === n ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
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
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-secondary-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-primary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-slate-400 animate-pulse font-medium">Loading categories...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary-100 to-primary flex items-center justify-center text-secondary-300">
                <IconGrid />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600 text-lg">No categories yet</p>
                <p className="text-sm text-slate-400 mt-1">Start organizing your products by creating categories</p>
              </div>
              <button
                onClick={openCreate}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-secondary-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <IconPlus /> Create First Category
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ─── Grid View ─────────────────────────────────── */
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((c, idx) => (
                  <div
                    key={c.id}
                    className="group relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                      {c.image ? (
                        <img
                          src={`${ASSET_BASE}/${c.image}`}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <IconImage />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                          c.is_active
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-slate-800/70 text-slate-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${c.is_active ? 'bg-white' : 'bg-slate-400'}`} />
                          {c.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                      {/* Order Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm text-white text-xs font-bold flex items-center justify-center">
                          {c.display_order}
                        </span>
                      </div>
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(c); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs rounded-full font-semibold text-slate-700 hover:bg-white transition-all hover:scale-105"
                        >
                          <IconEdit /> Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteCategory(c.id); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-secondary-500/90 backdrop-blur-sm text-xs rounded-full font-semibold text-white hover:bg-secondary-600 transition-all hover:scale-105"
                        >
                          <IconTrash /> Delete
                        </button>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3.5">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-secondary-600 transition-colors truncate">
                        {c.name}
                      </h3>
                      {c.slug && (
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                          <IconLink />
                          <span className="text-[10px] font-mono truncate">{c.slug}</span>
                        </div>
                      )}
                    </div>
                    {/* Bottom accent */}
                    <div className="h-0.5 bg-gradient-to-r from-primary  to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ─── Table View ────────────────────────────────── */
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50/80 to-secondary-50/30">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-20">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {items.map((c, idx) => (
                    <tr
                      key={c.id}
                      className="group hover:bg-gradient-to-r hover:from-secondary-50/40 hover:to-primary transition-all duration-200"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* Image */}
                      <td className="px-6 py-3.5">
                        <div className="h-12 w-12 rounded-xl border-2 border-slate-200/60 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden group-hover:border-secondary-300 group-hover:shadow-md group-hover:shadow-secondary-100 transition-all duration-300">
                          {c.image ? (
                            <img
                              src={`${ASSET_BASE}/${c.image}`}
                              alt={c.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          ) : (
                            <span className="text-slate-300"><IconImage /></span>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-800 group-hover:text-secondary-700 transition-colors duration-200">
                          {c.name}
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-3.5">
                        {c.slug ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-500 border border-slate-200/50">
                            <IconLink />
                            {c.slug}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Order */}
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600">
                          <IconMove />
                          <span className="text-sm font-bold">{c.display_order}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            c.is_active
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                          }`}
                        >
                          {c.is_active ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><IconCheck /></span>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-white"><IconX /></span>
                          )}
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1 opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 rounded-xl hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-all hover:scale-110"
                            title="Edit"
                          >
                            <IconEdit />
                          </button>
                          <button
                            onClick={() => deleteCategory(c.id)}
                            className="p-2 rounded-xl hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all hover:scale-110"
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
            <div className="px-6 py-4 border-t border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-secondary-50/20 flex items-center justify-between">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm hover:-translate-x-0.5"
              >
                <IconChevronLeft />
                Previous
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  Page <span className="font-extrabold text-secondary-600">{page}</span>
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-400">
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < per}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm hover:translate-x-0.5"
              >
                Next
                <IconChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* ─── CREATE / EDIT MODAL ────────────────────────────── */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-lg"
            style={{ marginTop: '0px' }}
            onClick={(e) => e.target === e.currentTarget && !submitting && setModalOpen(false)}
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ring-1 ring-slate-200/50">
              {/* Modal Header */}
              <div className="relative px-7 py-6 border-b border-slate-100 overflow-hidden">
                {/* Decorative gradient */}
                <div className={`absolute inset-0 opacity-[0.03] bg-gradient-to-br ${modalMode === 'create' ? 'from-secondary-500 to-red-500' : 'from-indigo-500 to-violet-500'}`} />
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${modalMode === 'create' ? 'bg-gradient-to-br from-primary-100 to-secondary-100 text-secondary-600' : 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600'}`}>
                      {modalMode === 'create' ? <IconPlus /> : <IconEdit />}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">
                        {modalMode === 'create' ? 'New Category' : 'Edit Category'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {modalMode === 'create' ? 'Create a new product category' : `Updating: ${formData.name}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-all duration-300"
                  >
                    <IconX />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-6">
                {/* ─── Image Upload Zone ──────────────────────── */}
                <div
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                    dragOver
                      ? 'border-secondary-400 bg-secondary-50 scale-[1.01]'
                      : 'border-slate-200 bg-gradient-to-br from-slate-50 to-secondary-50/30 hover:border-secondary-300 hover:bg-secondary-50/40'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFileSelect(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => document.getElementById('cat-image-input').click()}
                >
                  <input
                    id="cat-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />

                  {imagePreview ? (
                    <div className="relative group">
                      <div className="aspect-[3/1] overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-slate-700">
                          <IconUploadCloud />
                          Change Image
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center gap-3">
                      <div className="text-secondary-300">
                        <IconUploadCloud />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600">
                          Drop image here or <span className="text-secondary-600 underline underline-offset-2">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP • Max 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ─── Name ───────────────────────────────────── */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Category Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400 hover:border-slate-300 transition-all placeholder:text-slate-300"
                    placeholder="e.g. Men's Clothing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                {/* ─── Slug ───────────────────────────────────── */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconLink /> Slug <span className="text-slate-300 normal-case font-normal">(auto-generated if empty)</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400 hover:border-slate-300 transition-all font-mono placeholder:text-slate-300"
                    placeholder="mens-clothing"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                {/* ─── Order & Active ─────────────────────────── */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <IconMove /> Display Order
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-secondary-500/20 focus:border-secondary-400 hover:border-slate-300 transition-all"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="relative inline-flex items-center gap-3 cursor-pointer group w-full">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-focus:ring-2 peer-focus:ring-secondary-500/20 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500 transition-colors duration-300" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                          {formData.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <p className="text-[10px] text-slate-400">Visible to customers</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* ─── Submit ─────────────────────────────────── */}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    type="submit"
                    className="relative px-7 py-2.5 rounded-xl bg-gradient-to-r from-primary  to-secondary text-white text-sm font-bold shadow-xl shadow-secondary-500/25 hover:shadow-2xl hover:shadow-secondary-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : modalMode === 'create' ? 'Create Category' : 'Save Changes'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}