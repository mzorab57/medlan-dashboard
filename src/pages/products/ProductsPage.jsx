import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { downloadCSV } from '../../lib/csv';
import { useToast } from '../../store/toast';
import ProductVariantsManager from '../../components/ProductVariantsManager';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;

const INITIAL_FORM_STATE = {
  id: null,
  name: '',
  category_id: '',
  subcategory_id: '',
  brand_id: '',
  base_price: '',
  purchase_price: '',
  short_description: '',
  is_active: 1,
  is_featured: 0,
};

// ─── Icons ───────────────────────────────────────────────────────
function IconPlus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
function IconStar({ filled }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconX() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function IconFilter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
function IconUpload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function IconImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconPackage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function ProductsPage() {
  const { add } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [per] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [brandId] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterSubcategories, setFilterSubcategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formSubcategories, setFormSubcategories] = useState([]);

  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState('variants');

  useEffect(() => {
    async function loadGlobals() {
      try {
        const [cats, brs] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/brands'),
        ]);
        setCategories(cats.data || cats);
        setBrands(brs.data || brs);
      } catch (e) {
        console.error('Failed to load filters', e);
      }
    }
    loadGlobals();
  }, []);

  const fetchSubcategories = useCallback(async (catId) => {
    if (!catId) return [];
    try {
      const res = await api.get(`/api/subcategories?category_id=${catId}`);
      return Array.isArray(res.data || res) ? res.data || res : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setFilterSubcategories([]);
      setSubcategoryId('');
      return;
    }
    fetchSubcategories(categoryId).then(setFilterSubcategories);
  }, [categoryId, fetchSubcategories]);

  useEffect(() => {
    if (!modalOpen || !formData.category_id) {
      setFormSubcategories([]);
      return;
    }
    fetchSubcategories(formData.category_id).then(setFormSubcategories);
  }, [formData.category_id, modalOpen, fetchSubcategories]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(per));
      if (search.trim()) params.set('search', search.trim());
      if (categoryId) params.set('category_id', String(categoryId));
      if (subcategoryId) params.set('subcategory_id', String(subcategoryId));
      if (brandId) params.set('brand_id', String(brandId));
      if (featuredOnly) params.set('featured', '1');

      const res = await api.get(`/api/products?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, per, search, categoryId, subcategoryId, brandId, featuredOnly, add]);

  useEffect(() => {
    const t = setTimeout(() => fetchList(), 50);
    return () => clearTimeout(t);
  }, [fetchList]);

  function openCreate() {
    setModalMode('create');
    setFormData(INITIAL_FORM_STATE);
    setModalOpen(true);
  }

  async function openEdit(product) {
    setModalMode('edit');
    try {
      const res = await api.get(`/api/products?id=${product.id}`);
      const prod = Array.isArray(res) ? res[0] : res.product || res;
      setFormData({
        id: product.id,
        name: prod?.name ?? product.name,
        category_id: prod?.category_id ?? '',
        subcategory_id: prod?.subcategory_id ?? '',
        brand_id: prod?.brand_id ?? '',
        base_price: prod?.base_price ?? product.base_price,
        purchase_price: prod?.purchase_price ?? product.purchase_price,
        short_description: prod?.short_description ?? '',
        is_active: prod?.is_active ? 1 : 0,
        is_featured: prod?.is_featured ? 1 : 0,
      });
      if (prod?.category_id) {
        const subs = await fetchSubcategories(prod.category_id);
        setFormSubcategories(subs);
      }
      setModalOpen(true);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category_id: Number(formData.category_id),
      subcategory_id: formData.subcategory_id ? Number(formData.subcategory_id) : undefined,
      brand_id: formData.brand_id ? Number(formData.brand_id) : undefined,
      base_price: Number(formData.base_price),
      purchase_price: Number(formData.purchase_price),
      short_description: formData.short_description || undefined,
      is_active: Number(formData.is_active),
      is_featured: Number(formData.is_featured),
    };
    try {
      if (modalMode === 'create') {
        await api.post('/api/products', payload);
        add('Product created successfully', 'success');
      } else {
        await api.patch(`/api/products?id=${formData.id}`, payload);
        add('Product updated successfully', 'success');
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function openView(id) {
    setViewId(id);
    setViewLoading(true);
    setActiveViewTab('variants');
    try {
      const res = await api.get(`/api/products?id=${id}`);
      setViewData(res);
    } catch (e) {
      add(e.message, 'error');
      setViewId(null);
    } finally {
      setViewLoading(false);
    }
  }

  async function handleImageUpload(e) {
    e.preventDefault();
    if (!viewId) return;
    const form = e.target;
    const file = form.image.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('alt_text', form.alt_text ? form.alt_text.value || '' : '');
    fd.append('sort_order', form.sort_order ? form.sort_order.value || '0' : '0');
    fd.append('is_primary', form.is_primary && form.is_primary.checked ? '1' : '0');
    try {
      await api.postForm(`/api/products/${viewId}/images`, fd);
      add('Image uploaded', 'success');
      const res = await api.get(`/api/products?id=${viewId}`);
      setViewData(res);
      form.reset();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(imgId) {
    try {
      await api.del(`/api/images?id=${imgId}`);
      add('Image deleted', 'success');
      const res = await api.get(`/api/products?id=${viewId}`);
      setViewData(res);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function setPrimaryImage(imgId) {
    try {
      await api.patch(`/api/images?id=${imgId}`, { make_primary: 1 });
      const res = await api.get(`/api/products?id=${viewId}`);
      setViewData(res);
      add('Primary image updated', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function toggleFeatured(p) {
    try {
      await api.patch(`/api/products?id=${p.id}`, { is_featured: p.is_featured ? 0 : 1 });
      fetchList();
      add(p.is_featured ? 'Removed from featured' : 'Added to featured', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function deleteProduct(id) {
    try {
      await api.del(`/api/products?id=${id}`);
      fetchList();
      add('Product deleted', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function exportCSV() {
    try {
      add('Preparing CSV...', 'info');
      const rows = [];
      let p = 1;
      while (true) {
        const params = new URLSearchParams({
          page: String(p),
          per_page: '100',
          ...(search && { search }),
          ...(categoryId && { category_id: categoryId }),
          ...(subcategoryId && { subcategory_id: subcategoryId }),
          ...(brandId && { brand_id: brandId }),
        });
        const res = await api.get(`/api/products?${params.toString()}`);
        const chunk = res.data || res;
        if (!Array.isArray(chunk) || chunk.length === 0) break;
        rows.push(...chunk);
        if (chunk.length < 100) break;
        p++;
      }
      downloadCSV('products.csv', rows, [
        { header: 'ID', key: 'id' },
        { header: 'Name', key: 'name' },
        { header: 'Brand', key: 'brand_name' },
        { header: 'Base Price', key: 'base_price' },
        { header: 'Purchase Price', key: 'purchase_price' },
        { header: 'Total Stock', key: 'total_stock' },
        { header: 'Active', key: 'is_active' },
      ]);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <IconPackage />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Product Catalog
              </h1>
              <p className="text-sm text-slate-400">
                {items.length} product{items.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <IconPlus />
            <span>Add Product</span>
          </button>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
              <IconFilter />
            </div>
            <span className="text-sm font-semibold text-slate-600">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IconSearch />
              </div>
              <input
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category */}
            <select
              className="rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all appearance-none cursor-pointer"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Subcategory */}
            <select
              className="rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50/50 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}
            >
              <option value="">All Subcategories</option>
              {filterSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  featuredOnly
                    ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-sm'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <IconStar filled={featuredOnly} />
                <span className="hidden sm:inline">Featured</span>
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
              >
                <IconDownload />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Product Table ──────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
              </div>
              <p className="text-sm text-slate-400 animate-pulse">Loading products...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <IconPackage />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-500">No products found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new product</p>
              </div>
              <button
                onClick={openCreate}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition"
              >
                <IconPlus /> Add Product
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-50/50">
                      <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                        Image
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Selling Price
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Cost Price
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="group hover:bg-blue-50/40 cursor-pointer transition-colors duration-150"
                        onClick={() => openView(p.id)}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        {/* Image */}
                        <td className="px-5 py-3">
                          <div className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group-hover:border-blue-300 group-hover:shadow-sm transition-all">
                            {p.primary_image ? (
                              <img
                                src={`${ASSET_BASE}/${p.primary_image}`}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.style.display = 'none')}
                              />
                            ) : (
                              <span className="text-slate-300">
                                <IconImage />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Product Info */}
                        <td className="px-5 py-3">
                          <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                            {p.name}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {p.is_featured ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 font-medium">
                                <IconStar filled />
                                Featured
                              </span>
                            ) : null}
                            {p.brand_name && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                {p.brand_name}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Selling Price */}
                        <td className="px-5 py-3">
                          <span className="font-bold text-emerald-700 text-sm">
                            {Number(p.base_price).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">IQD</span>
                        </td>

                        {/* Cost Price */}
                        <td className="px-5 py-3">
                          <span className="font-medium text-slate-500 text-sm">
                            {Number(p.purchase_price).toLocaleString()}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-sm font-semibold ${
                                Number(p.total_stock || 0) === 0
                                  ? 'text-red-600'
                                  : Number(p.total_stock || 0) < 10
                                  ? 'text-amber-600'
                                  : 'text-slate-700'
                              }`}
                            >
                              {Number(p.total_stock || 0).toLocaleString()}
                            </span>
                            {Number(p.total_stock || 0) === 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold uppercase">
                                Out
                              </span>
                            )}
                            {Number(p.total_stock || 0) > 0 && Number(p.total_stock || 0) < 10 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold uppercase">
                                Low
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              p.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1 transition-opacity duration-200">
                            <button
                              className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors"
                              title="View"
                              onClick={() => openView(p.id)}
                            >
                              <IconEye />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Edit"
                              onClick={() => openEdit(p)}
                            >
                              <IconEdit />
                            </button>
                            <button
                              className={`p-2 rounded-lg transition-colors ${
                                p.is_featured
                                  ? 'text-amber-500 hover:bg-amber-100'
                                  : 'text-slate-400 hover:bg-amber-100 hover:text-amber-500'
                              }`}
                              title="Toggle Featured"
                              onClick={() => toggleFeatured(p)}
                            >
                              <IconStar filled={!!p.is_featured} />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                              onClick={() => deleteProduct(p.id)}
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

              {/* Pagination */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm"
                >
                  <IconChevronLeft />
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    Page <span className="font-bold text-slate-700">{page}</span>
                  </span>
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < per}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-sm"
                >
                  Next
                  <IconChevronRight />
                </button>
              </div>
            </>
          )}
        </div>

        {/* ─── CREATE / EDIT MODAL ────────────────────────────── */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
            style={{ marginTop: '0px' }}
            onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      modalMode === 'create'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    {modalMode === 'create' ? <IconPlus /> : <IconEdit />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {modalMode === 'create' ? 'Add New Product' : 'Edit Product'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {modalMode === 'create'
                        ? 'Fill in the details to create a product'
                        : 'Update product information'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <IconX />
                </button>
              </div>

              {/* Modal Form */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-5"
              >
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all appearance-none cursor-pointer"
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Subcategory
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      value={formData.subcategory_id}
                      onChange={(e) =>
                        setFormData({ ...formData, subcategory_id: e.target.value })
                      }
                      disabled={!formData.category_id}
                    >
                      <option value="">Select Subcategory</option>
                      {formSubcategories.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Brand
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all appearance-none cursor-pointer"
                      value={formData.brand_id}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_id: e.target.value })
                      }
                    >
                      <option value="">Select Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Sell Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all"
                        value={formData.base_price}
                        onChange={(e) =>
                          setFormData({ ...formData, base_price: e.target.value })
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                        Cost Price <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all"
                        value={formData.purchase_price}
                        onChange={(e) =>
                          setFormData({ ...formData, purchase_price: e.target.value })
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:bg-white transition-all resize-none"
                    rows={3}
                    value={formData.short_description}
                    onChange={(e) =>
                      setFormData({ ...formData, short_description: e.target.value })
                    }
                    placeholder="Brief product description..."
                  />
                </div>

                {/* Toggles */}
                <div className="flex gap-6 pt-2">
                  <label className="relative inline-flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })
                        }
                      />
                      <div className="w-10 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:border-emerald-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                      Active
                    </span>
                  </label>

                  <label className="relative inline-flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={!!formData.is_featured}
                        onChange={(e) =>
                          setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })
                        }
                      />
                      <div className="w-10 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:border-amber-500 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                      Featured
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── VIEW / DETAILS MODAL ───────────────────────────── */}
        {viewId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
            style={{ marginTop: '0px' }}
            onClick={(e) => e.target === e.currentTarget && setViewId(null)}
          >
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[95vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                    <IconPackage />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {viewData?.product?.name || 'Product Details'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      ID: {viewId} • Code: {viewData?.product?.code || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewId(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <IconX />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex gap-1">
                  {[
                    // { id: 'details', label: 'Details', icon: <IconPackage /> },
                    { id: 'variants', label: 'Variants', icon: <IconPlus /> },
                    { id: 'images', label: 'Images', icon: <IconImage /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveViewTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                        activeViewTab === tab.id
                          ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {viewLoading || !viewData ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                    <p className="text-sm text-slate-400">Loading details...</p>
                  </div>
                ) : (
                  <>
                    {/* ─── Details Tab ─────────────────────────── */}
                    {activeViewTab === 'details' && (
                      <div className="space-y-6">
                      
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            {
                              label: 'Product Name',
                              value: viewData.product?.name,
                              color: 'blue',
                            },
                            {
                              label: 'Product Code',
                              value: viewData.product?.code || 'N/A',
                              color: 'slate',
                              mono: true,
                            },
                            {
                              label: 'Selling Price',
                              value: `${Number(viewData.product?.base_price).toLocaleString()} IQD`,
                              color: 'emerald',
                            },
                            {
                              label: 'Purchase Price',
                              value: `${Number(viewData.product?.purchase_price).toLocaleString()} IQD`,
                              color: 'orange',
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-xl border p-4 bg-${item.color}-50/50 border-${item.color}-200/50`}
                            >
                              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                {item.label}
                              </div>
                              <div
                                className={`mt-1 font-bold text-${item.color}-700 ${
                                  item.mono ? 'font-mono' : ''
                                } text-lg`}
                              >
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>

                      
                        {viewData.product?.short_description && (
                          <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              Description
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {viewData.product.short_description}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                              viewData.product?.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                viewData.product?.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {viewData.product?.is_active ? 'Active' : 'Inactive'}
                          </div>
                          {viewData.product?.is_featured ? (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold">
                              <IconStar filled />
                              Featured
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}

  {/* ─── Variants Tab ────────────────────────── */}
                    {activeViewTab === 'variants' && (
                      <div>
                        <ProductVariantsManager
                          productId={viewId}
                          specs={viewData.specs || []}
                          onReload={() => openView(viewId)}
                        />
                      </div>
                    )}

                    {/* ─── Images Tab ──────────────────────────── */}
                    {activeViewTab === 'images' && (
                      <div className="space-y-6">
                        {/* Image Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(viewData.images || []).map((img) => (
                            <div
                              key={img.id}
                              className="group relative rounded-2xl border border-slate-200 overflow-hidden aspect-square bg-slate-50 hover:shadow-lg transition-all duration-300"
                            >
                              <img
                                src={`${ASSET_BASE}/${img.image}`}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                              {img.is_primary && (
                                <span className="absolute top-3 left-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] px-2.5 py-1 rounded-full shadow-lg font-semibold">
                                  ✓ Primary
                                </span>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-4 gap-2">
                                {!img.is_primary && (
                                  <button
                                    onClick={() => setPrimaryImage(img.id)}
                                    className="px-4 py-1.5 bg-white/90 backdrop-blur-sm text-xs rounded-full hover:bg-white font-medium text-slate-700 transition-all hover:scale-105"
                                  >
                                    Set Primary
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteImage(img.id)}
                                  className="px-4 py-1.5 bg-red-500/90 backdrop-blur-sm text-white text-xs rounded-full hover:bg-red-600 font-medium transition-all hover:scale-105"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}

                          {/* Empty state */}
                          {(viewData.images || []).length === 0 && (
                            <div className="col-span-full flex flex-col items-center py-12 text-slate-400">
                              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                                <IconImage />
                              </div>
                              <p className="text-sm font-medium">No images yet</p>
                              <p className="text-xs">Upload an image below</p>
                            </div>
                          )}
                        </div>

                        {/* Upload Form */}
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 hover:border-blue-300 transition-colors">
                          <form
                            onSubmit={handleImageUpload}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                <IconUpload />
                              </div>
                              <span className="text-sm font-semibold text-slate-600">
                                Upload New Image
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                              <div className="md:col-span-2">
                                <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase tracking-wide">
                                  Image File
                                </label>
                                <input
                                  type="file"
                                  name="image"
                                  className="w-full text-sm border border-slate-200 rounded-xl bg-white p-2 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase tracking-wide">
                                  Alt Text
                                </label>
                                <input
                                  name="alt_text"
                                  type="text"
                                  placeholder="Description..."
                                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                />
                              </div>
                              <div className="flex gap-3 items-end">
                                <div className="w-20">
                                  <label className="text-xs text-slate-500 font-semibold mb-1 block uppercase tracking-wide">
                                    Sort
                                  </label>
                                  <input
                                    name="sort_order"
                                    type="number"
                                    defaultValue="0"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
                                  />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer pb-2">
                                  <input name="is_primary" type="checkbox" className="rounded" />
                                  <span className="text-xs text-slate-500 font-medium">Primary</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                disabled={uploading}
                                type="submit"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <IconUpload />
                                {uploading ? 'Uploading...' : 'Upload Image'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                  
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}