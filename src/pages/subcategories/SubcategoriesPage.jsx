import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { useToast } from '../../store/toast';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;

const INITIAL_STATE = {
  id: null,
  category_id: '',
  name: '',
  slug: '',
  image: '',
  imageFile: null,
  display_order: 0,
  is_active: 1,
};

// ─── Icons ───────────────────────────────────────────────────────
function IconLayers() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>);
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
function IconFolder() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>);
}
function IconLink() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>);
}
function IconMove() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15" /><polyline points="9 5 12 2 15 5" /><polyline points="15 19 12 22 9 19" /><polyline points="19 9 22 12 19 15" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="12" y1="2" x2="12" y2="22" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconChevronDown() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
}

export default function SubcategoriesPage() {
  const { add } = useToast();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [per, setPer] = useState(20);
  const [catFilter, setCatFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await api.get('/api/categories');
        setCategories(res.data || res);
      } catch (e) { console.error(e); }
    }
    loadCats();
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(per));
      if (catFilter) params.set('category_id', catFilter);
      if (activeFilter !== '') params.set('active', activeFilter);
      const res = await api.get(`/api/subcategories?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, per, catFilter, activeFilter, add]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => String(c.id) === String(catId));
    return cat ? cat.name : '—';
  };

  function openCreate() {
    setModalMode('create');
    setFormData({ ...INITIAL_STATE, category_id: catFilter || '' });
    setImagePreview(null);
    setModalOpen(true);
  }

  function openEdit(sub) {
    setModalMode('edit');
    setFormData({
      id: sub.id,
      category_id: sub.category_id,
      name: sub.name,
      slug: sub.slug || '',
      image: sub.image || '',
      imageFile: null,
      display_order: sub.display_order || 0,
      is_active: sub.is_active ? 1 : 0,
    });
    setImagePreview(sub.image ? `${ASSET_BASE}/${sub.image}` : null);
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
        category_id: Number(formData.category_id),
        name: formData.name,
        slug: formData.slug || undefined,
        display_order: Number(formData.display_order),
        is_active: Number(formData.is_active),
      };
      let subId = formData.id;
      if (modalMode === 'create') {
        const res = await api.post('/api/subcategories', payload);
        subId = res.id || res.data?.id;
        add('Subcategory created', 'success');
      } else {
        await api.patch(`/api/subcategories?id=${subId}`, payload);
        add('Subcategory updated', 'success');
      }
      if (formData.imageFile && subId) {
        const fd = new FormData();
        fd.append('image', formData.imageFile);
        await api.postForm(`/api/subcategories/${subId}/image`, fd);
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteSubcategory(id) {
    try {
      await api.del(`/api/subcategories?id=${id}`);
      fetchList();
      add('Subcategory deleted', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  const activeCount = items.filter((s) => s.is_active).length;
  const inactiveCount = items.length - activeCount;

  // Group by category for grid view
  const grouped = items.reduce((acc, s) => {
    const catName = s.category_name || getCategoryName(s.category_id);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
                <IconLayers />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{items.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Subcategories
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
          <button
            onClick={openCreate}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <IconPlus />
            <span>Add Subcategory</span>
          </button>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <IconFilter />
              </div>

              {/* Parent Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-3 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all cursor-pointer font-medium text-slate-600"
                  value={catFilter}
                  onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All Parents</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <IconChevronDown />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1">
                {[
                  { value: '', label: 'All' },
                  { value: '1', label: 'Active' },
                  { value: '0', label: 'Inactive' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setActiveFilter(opt.value); setPage(1); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      activeFilter === opt.value
                        ? 'bg-white text-primary shadow-sm ring-1 ring-primary/10'
                        : 'text-muted hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode */}
              <div className="flex gap-1 bg-slate-100/80 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-slate-600'}`}
                  title="Table"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted hover:text-slate-600'}`}
                  title="Grid"
                >
                  <IconLayers />
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
                        per === n ? 'bg-white text-primary shadow-sm' : 'text-muted hover:text-slate-600'
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
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-muted animate-pulse font-medium">Loading subcategories...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary/30">
                <IconLayers />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600 text-lg">No subcategories yet</p>
                <p className="text-sm text-muted mt-1">Organize your products with subcategories</p>
              </div>
              <button
                onClick={openCreate}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <IconPlus /> Create First Subcategory
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ─── Grouped Grid View ────────────────────────── */
            <div className="p-5 space-y-6">
              {Object.entries(grouped).map(([catName, subs]) => (
                <div key={catName}>
                  {/* Category Group Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded-lg bg-primary/10 text-primary">
                      <IconFolder />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700">{catName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {subs.length}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent ml-2" />
                  </div>

                  {/* Sub Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {subs.map((s, idx) => (
                      <div
                        key={s.id}
                        className="group relative rounded-2xl border border-slate-200/60 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
                          {s.image ? (
                            <img
                              src={`${ASSET_BASE}/${s.image}`}
                              alt={s.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary/15">
                              <IconImage />
                            </div>
                          )}
                          {/* Status */}
                          <div className="absolute top-2 left-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-sm ${
                              s.is_active ? 'bg-accent/90 text-white' : 'bg-slate-800/70 text-slate-200'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${s.is_active ? 'bg-white' : 'bg-slate-400'}`} />
                              {s.is_active ? 'Active' : 'Off'}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2">
                            <span className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold flex items-center justify-center">
                              {s.display_order}
                            </span>
                          </div>
                          {/* Hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3 gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs rounded-full font-semibold text-slate-700 hover:bg-white transition-all hover:scale-105"
                            >
                              <IconEdit /> Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSubcategory(s.id); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-xs rounded-full font-semibold text-white hover:bg-red-600 transition-all hover:scale-105"
                            >
                              <IconTrash /> Delete
                            </button>
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <h4 className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors truncate">{s.name}</h4>
                          {s.slug && (
                            <div className="flex items-center gap-1 mt-1 text-muted">
                              <IconLink />
                              <span className="text-[10px] font-mono truncate">{s.slug}</span>
                            </div>
                          )}
                        </div>
                        <div className="h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ─── Table View ────────────────────────────────── */
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-secondary/5">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-16">Image</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parent</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subcategory</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slug</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest w-24">Order</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {items.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-6 py-3.5">
                        <div className="h-11 w-11 rounded-xl border-2 border-slate-200/60 bg-gradient-to-br from-slate-50 to-primary/5 flex items-center justify-center overflow-hidden group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/10 transition-all duration-300">
                          {s.image ? (
                            <img src={`${ASSET_BASE}/${s.image}`} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => (e.target.style.display = 'none')} />
                          ) : (
                            <span className="text-primary/20"><IconImage /></span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-primary/10 text-primary">
                            <IconFolder />
                          </div>
                          <span className="text-sm text-slate-500 font-medium">{s.category_name || getCategoryName(s.category_id)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{s.name}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        {s.slug ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-500 border border-slate-200/50">
                            <IconLink />{s.slug}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600">
                          <IconMove />
                          <span className="text-sm font-bold">{s.display_order}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          s.is_active
                           ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                        }`}>
                          {s.is_active ? (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><IconCheck /></span>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-white"><IconX /></span>
                          )}
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1 opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                          <button onClick={() => openEdit(s)} className="p-2 rounded-xl hover:bg-primary/10 text-muted hover:text-primary transition-all hover:scale-110" title="Edit">
                            <IconEdit />
                          </button>
                          <button onClick={() => deleteSubcategory(s.id)} className="p-2 rounded-xl hover:bg-red-100 text-muted hover:text-red-600 transition-all hover:scale-110" title="Delete">
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm hover:-translate-x-0.5"
              >
                <IconChevronLeft /> Previous
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  Page <span className="font-extrabold text-primary">{page}</span>
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-muted">{items.length} items</span>
              </div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < per}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm hover:translate-x-0.5"
              >
                Next <IconChevronRight />
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
              {/* Header */}
              <div className="relative px-7 py-6 border-b border-slate-100 overflow-hidden">
                <div className={`absolute inset-0 opacity-[0.04] bg-gradient-to-br ${modalMode === 'create' ? 'from-primary to-secondary' : 'from-secondary to-primary'}`} />
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${modalMode === 'create' ? 'from-primary/10 to-secondary/10 text-primary' : 'from-secondary/10 to-primary/10 text-secondary'}`}>
                      {modalMode === 'create' ? <IconPlus /> : <IconEdit />}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">
                        {modalMode === 'create' ? 'New Subcategory' : 'Edit Subcategory'}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        {modalMode === 'create' ? 'Add a new subcategory to organize products' : `Updating: ${formData.name}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-muted hover:text-slate-600 hover:rotate-90 transition-all duration-300"
                  >
                    <IconX />
                  </button>
                </div>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-5">
                {/* Image Upload */}
                <div
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                    dragOver
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-slate-200 bg-gradient-to-br from-slate-50 to-primary/5 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
                  onClick={() => document.getElementById('sub-image-input').click()}
                >
                  <input
                    id="sub-image-input"
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
                          <IconUploadCloud /> Change Image
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center gap-2">
                      <div className="text-primary/25"><IconUploadCloud /></div>
                      <p className="text-sm font-semibold text-slate-600">
                        Drop image or <span className="text-primary underline underline-offset-2">browse</span>
                      </p>
                      <p className="text-[11px] text-muted">PNG, JPG, WEBP • Max 5MB</p>
                    </div>
                  )}
                </div>

                {/* Parent Category */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconFolder /> Parent Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all appearance-none cursor-pointer"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                    >
                      <option value="">Select parent category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <IconChevronDown />
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Subcategory Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all placeholder:text-slate-300"
                    placeholder="e.g. T-Shirts"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconLink /> Slug <span className="text-slate-300 normal-case font-normal">(auto if empty)</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all font-mono placeholder:text-slate-300"
                    placeholder="t-shirts"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <IconMove /> Display Order
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all"
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
                        <div className="w-12 h-7 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:shadow-sm after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-emerald-500 transition-colors duration-300" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-600">{formData.is_active ? 'Active' : 'Inactive'}</span>
                        <p className="text-[10px] text-muted">Visible on website</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-slate-100 hover:text-slate-700 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={submitting}
                    type="submit"
                    className="relative px-7 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : modalMode === 'create' ? 'Create Subcategory' : 'Save Changes'}
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