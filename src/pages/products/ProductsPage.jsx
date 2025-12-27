import { useEffect, useState, useCallback, useMemo } from 'react';
import { api, API_BASE } from '../../lib/api';
import { downloadCSV } from '../../lib/csv';
import { useToast } from '../../store/toast';
import ProductVariantsManager from '../../components/ProductVariantsManager';

const ASSET_BASE = API_BASE.replace(/\/public$/, '');

// Initial state for forms to avoid repetition
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

export default function ProductsPage() {
  const { add } = useToast();
  
  // --- Main Data States ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filter States ---
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // --- Dropdown Data States ---
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filterSubcategories, setFilterSubcategories] = useState([]); // Subcats for main filter
  
  // --- Modal & Form States ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formSubcategories, setFormSubcategories] = useState([]); // Subcats for the modal form

  // --- View Modal States ---
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Initial Load (Categories & Brands)
  useEffect(() => {
    async function loadGlobals() {
      try {
        const [cats, brs] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/brands')
        ]);
        setCategories(cats.data || cats);
        setBrands(brs.data || brs);
      } catch (e) {
        console.error("Failed to load filters", e);
      }
    }
    loadGlobals();
  }, []);

  // 2. Load Subcategories Helper
  const fetchSubcategories = useCallback(async (catId) => {
    if (!catId) return [];
    try {
      const res = await api.get(`/api/subcategories?category_id=${catId}`);
      return Array.isArray(res.data || res) ? (res.data || res) : [];
    } catch { return []; }
  }, []);

  // 3. Effect: Load Filter Subcategories when Filter Category changes
  useEffect(() => {
    if (!categoryId) {
      setFilterSubcategories([]);
      setSubcategoryId('');
      return;
    }
    fetchSubcategories(categoryId).then(setFilterSubcategories);
  }, [categoryId, fetchSubcategories]);

  // 4. Effect: Load Form Subcategories when Form Category changes
  useEffect(() => {
    if (!modalOpen || !formData.category_id) {
      setFormSubcategories([]);
      return;
    }
    fetchSubcategories(formData.category_id).then(setFormSubcategories);
  }, [formData.category_id, modalOpen, fetchSubcategories]);

  // 5. Main List Fetcher
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

  // Debounce Search Effect
  useEffect(() => {
    const t = setTimeout(() => {
      fetchList();
    }, 50); // 400ms delay
    return () => clearTimeout(t);
  }, [fetchList]);

  // --- Handlers: Form (Create/Edit) ---
  function openCreate() {
    setModalMode('create');
    setFormData(INITIAL_FORM_STATE);
    setModalOpen(true);
  }

  async function openEdit(product) {
    setModalMode('edit');
    try {
      const res = await api.get(`/api/products?id=${product.id}`);
      const prod = Array.isArray(res) ? res[0] : (res.product || res);
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

  // --- Handlers: View & Images ---
  async function openView(id) {
    setViewId(id);
    setViewLoading(true);
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
    fd.append('alt_text', form.alt_text ? (form.alt_text.value || '') : '');
    fd.append('sort_order', form.sort_order ? (form.sort_order.value || '0') : '0');
    fd.append('is_primary', form.is_primary && form.is_primary.checked ? '1' : '0');

    try {
      await api.postForm(`/api/products/${viewId}/images`, fd);
      add('Image uploaded', 'success');
      // Refresh view data
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
    add('Deleting image...', 'error', 1500);
    try {
      await api.del(`/api/images?id=${imgId}`);
      const res = await api.get(`/api/products?id=${viewId}`);
      setViewData(res);
      
    } catch (e) { add(e.message, 'error'); }
  }

  async function setPrimaryImage(imgId) {
    try {
      await api.patch(`/api/images?id=${imgId}`, { make_primary: 1 });
      const res = await api.get(`/api/products?id=${viewId}`);
      setViewData(res);
      add('Primary image updated', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  // --- Handlers: Actions ---
  async function toggleFeatured(p) {
    try {
      await api.patch(`/api/products?id=${p.id}`, { is_featured: p.is_featured ? 0 : 1 });
      fetchList();
      add(p.is_featured ? 'Removed from featured' : 'Added to featured', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function deleteProduct(id) {
    
    try {
      await api.del(`/api/products?id=${id}`);
      fetchList();
      add('Deleting product...', 'error', 1500);
    } catch (e) { add(e.message, 'error'); }
  }

  async function exportCSV() {
    try {
      add('Preparing CSV...', 'info');
      const rows = [];
      let p = 1;
      while (true) {
        const params = new URLSearchParams({ 
           page: String(p), per_page: '100', 
           ...(search && { search }), 
           ...(categoryId && { category_id: categoryId }),
           ...(subcategoryId && { subcategory_id: subcategoryId }),
           ...(brandId && { brand_id: brandId })
        });
        
        const res = await api.get(`/api/products?${params.toString()}`);
        const chunk = res.data || res;
        if (!Array.isArray(chunk) || chunk.length === 0) break;
        rows.push(...chunk);
        if (chunk.length < 100) break;
        p++;
      }
      downloadCSV('products.csv', rows, [
        { header: 'ID', key: 'id' }, { header: 'Name', key: 'name' },
        { header: 'Brand', key: 'brand_name' }, { header: 'Category', key: 'category_name' },
        { header: 'Base Price', key: 'base_price' }, { header: 'Active', key: 'is_active' }
      ]);
    } catch (e) { add(e.message, 'error'); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Product Catalog</h2>
        <button onClick={openCreate} className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 shadow-sm">
          + Add Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-sm">
        <input
          placeholder="Search products..."
          className="rounded-md border px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded-md border px-3 py-2 w-full bg-white" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        
        {/* Dynamic Subcategory Filter */}
        <select 
           className="rounded-md border px-3 py-2 w-full bg-white disabled:bg-gray-100" 
           value={subcategoryId} 
           onChange={(e) => setSubcategoryId(e.target.value)}
           disabled={!categoryId}
        >
          <option value="">All Subcategories</option>
          {filterSubcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <div className="flex gap-2 items-center">
             <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded border cursor-pointer hover:bg-gray-100">
                <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} />
                <span>Featured</span>
             </label>
             <button onClick={exportCSV} className="text-sm border px-3 py-2 rounded hover:bg-gray-50 flex-1">Export</button>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left w-16">Image</th>
                  <th className="px-4 py-3 text-left">Product Name</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-blue-50 cursor-pointer transition" onClick={() => openView(p.id)}>
                    <td className="px-4 py-2">
                        <div className="h-12 w-12 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                            {p.primary_image ? (
                                <img src={`${ASSET_BASE}/${p.primary_image}`} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                            ) : (
                                <span className="text-xs text-gray-400">N/A</span>
                            )}
                        </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="flex gap-2 mt-1">
                          {p.is_featured ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">Featured</span> : null}
                          {p.brand_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{p.brand_name}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{Number(p.base_price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category_name || '-'}</td>
                    <td className="px-4 py-3">
                         <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                         </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Edit" onClick={() => openEdit(p)}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z"/><path d="M5 15h10v2H5a2 2 0 0 1-2-2V5h2v10z"/></svg>
                        </button>
                        <button className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600" title="Toggle Feature" onClick={() => toggleFeatured(p)}>
                           <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${p.is_featured ? 'fill-yellow-500' : 'fill-gray-400'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 14.347l-2.987 2.134c-.784.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 0 0 .95-.69l1.07-3.292z"/></svg>
                        </button>
                        <button className="p-1.5 rounded hover:bg-red-100 text-red-500" title="Delete" onClick={() => deleteProduct(p.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2h3v2H3V2h3zm2 6h2v8H8V8zm4 0h2v8h-2V8z"/></svg>
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
        <div className="p-3 border-t bg-gray-50 flex items-center justify-between">
            <button disabled={page<=1} onClick={() => setPage(p => p-1)} className="px-3 py-1 bg-white border rounded disabled:opacity-50 text-sm">Previous</button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} className="px-3 py-1 bg-white border rounded text-sm">Next</button>
        </div>
      </div>

      {/* UNIFIED CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
               <h3 className="text-xl font-bold">{modalMode === 'create' ? 'Add New Product' : 'Edit Product'}</h3>
               <button onClick={() => setModalOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="text-xs text-gray-500 font-semibold uppercase">Product Name *</label>
                 <input className="w-full mt-1 rounded border px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              
              <div>
                 <label className="text-xs text-gray-500 font-semibold uppercase">Category *</label>
                 <select className="w-full mt-1 rounded border px-3 py-2 bg-white" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>

              <div>
                 <label className="text-xs text-gray-500 font-semibold uppercase">Subcategory</label>
                 <select 
                    className="w-full mt-1 rounded border px-3 py-2 bg-white disabled:bg-gray-100" 
                    value={formData.subcategory_id} 
                    onChange={e => setFormData({...formData, subcategory_id: e.target.value})}
                    disabled={!formData.category_id}
                 >
                    <option value="">Select Subcategory</option>
                    {formSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>

              <div>
                 <label className="text-xs text-gray-500 font-semibold uppercase">Brand</label>
                 <select className="w-full mt-1 rounded border px-3 py-2 bg-white" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="text-xs text-gray-500 font-semibold uppercase">Base Price *</label>
                    <input type="number" step="0.01" className="w-full mt-1 rounded border px-3 py-2" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} required />
                 </div>
                 <div>
                    <label className="text-xs text-gray-500 font-semibold uppercase">Purchase Price *</label>
                    <input type="number" step="0.01" className="w-full mt-1 rounded border px-3 py-2" value={formData.purchase_price} onChange={e => setFormData({...formData, purchase_price: e.target.value})} required />
                 </div>
              </div>

              <div className="md:col-span-2">
                 <label className="text-xs text-gray-500 font-semibold uppercase">Short Description</label>
                 <textarea className="w-full mt-1 rounded border px-3 py-2" rows={3} value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} />
              </div>

              <div className="md:col-span-2 flex gap-6 pt-2">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={!!formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} />
                    <span className="text-sm font-medium">Active Status</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-yellow-500 rounded" checked={!!formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked ? 1 : 0})} />
                    <span className="text-sm font-medium">Featured Product</span>
                 </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                 <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                 <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW / DETAILS MODAL */}
      {viewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
           <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden h-[95vh] flex flex-col">
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="text-xl font-bold">Product Details</h3>
                 <button onClick={() => setViewId(null)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                 {viewLoading || !viewData ? (
                    <div className="text-center py-20">Loading details...</div>
                 ) : (
                    <div className="space-y-8">
                       {/* Basic Info */}
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                          <div>
                             <div className="text-xs text-gray-500 uppercase">Product</div>
                             <div className="font-bold text-gray-800">{viewData.product?.name}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-500 uppercase">Code</div>
                             <div className="font-mono text-gray-700">{viewData.product?.code || 'N/A'}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-500 uppercase">Selling Price</div>
                             <div className="font-bold text-green-700">{Number(viewData.product?.base_price).toLocaleString()}</div>
                          </div>
                          <div>
                             <div className="text-xs text-gray-500 uppercase">Purchase Price</div>
                             <div className="font-medium text-gray-600">{Number(viewData.product?.purchase_price).toLocaleString()}</div>
                          </div>
                       </div>

                       {/* Images Section */}
                       <div>
                          <h4 className="text-lg font-bold mb-3 border-b pb-2">Images</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                             {(viewData.images || []).map(img => (
                                <div key={img.id} className="group relative rounded-lg border overflow-hidden aspect-square bg-gray-100">
                                   <img src={`${ASSET_BASE}/${img.image}`} className="w-full h-full object-cover" alt="" />
                                   {img.is_primary && <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow">Primary</span>}
                                   
                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                                       {!img.is_primary && (
                                           <button onClick={() => setPrimaryImage(img.id)} className="px-3 py-1 bg-white text-xs rounded hover:bg-gray-200">Set Primary</button>
                                       )}
                                       <button onClick={() => deleteImage(img.id)} className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Delete</button>
                                   </div>
                                </div>
                             ))}
                          </div>
                          
                          {/* Upload Form */}
                          <form onSubmit={handleImageUpload} className="flex flex-col md:flex-row gap-3 items-end bg-gray-50 p-3 rounded border">
                             <div className="flex-1 w-full">
                                <label className="text-xs text-gray-500 mb-1 block">New Image</label>
                                <input type="file" name="image" className="text-sm w-full border rounded bg-white p-1" required />
                             </div>
                             <div className="w-24">
                                <label className="text-xs text-gray-500 mb-1 block">Sort</label>
                                <input name="sort_order" type="number" defaultValue="0" className="w-full border rounded px-2 py-1.5 text-sm" />
                             </div>
                             <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Alt Text</label>
                                <input name="alt_text" type="text" placeholder="Optional description" className="w-full border rounded px-2 py-1.5 text-sm" />
                             </div>
                             <div className="pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                   <input name="is_primary" type="checkbox" />
                                   <span className="text-sm">Primary</span>
                                </label>
                             </div>
                             <button disabled={uploading} type="submit" className="bg-gray-900 text-white px-4 py-1.5 rounded text-sm hover:bg-gray-800 disabled:opacity-50">
                                {uploading ? 'Uploading...' : 'Upload'}
                             </button>
                          </form>
                       </div>

                       {/* Variants Section */}
                       <div>
                          <h4 className="text-lg font-bold mb-3 border-b pb-2">Product Variants</h4>
                          <ProductVariantsManager 
                             productId={viewId} 
                             specs={viewData.specs || []} 
                             onReload={() => openView(viewId)} 
                          />
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
