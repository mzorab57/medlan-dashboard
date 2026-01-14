import { useEffect, useState, useCallback } from 'react';
import { api, API_BASE } from '../../lib/api';
import { useToast } from '../../store/toast';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;

// Initial state for the form
const INITIAL_STATE = {
  id: null,
  name: '',
  slug: '',
  image: '', // Stores the string path from DB
  imageFile: null, // Stores the new file to upload
  display_order: 0,
  is_active: 1,
};

export default function CategoriesPage() {
  const { add } = useToast();

  // --- Main Data States ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filter States ---
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(20);
  const [activeFilter, setActiveFilter] = useState('');

  // --- Modal & Form States ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch List
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

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 2. Modal Handlers
  function openCreate() {
    setModalMode('create');
    setFormData(INITIAL_STATE);
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
    setModalOpen(true);
  }

  // 3. Submit Handler (Create & Update)
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        // Don't send 'image' string here, it's handled via upload endpoint usually
        // or strictly kept as is. API depends on implementation.
        display_order: Number(formData.display_order),
        is_active: Number(formData.is_active),
      };

      let categoryId = formData.id;

      // A. Create or Update Core Data
      if (modalMode === 'create') {
        const res = await api.post('/api/categories', payload);
        categoryId = res.id || res.data?.id;
        add('Category created successfully', 'success');
      } else {
        await api.patch(`/api/categories?id=${categoryId}`, payload);
        add('Category updated successfully', 'success');
      }

      // B. Handle Image Upload (if file selected)
      if (formData.imageFile && categoryId) {
        const fd = new FormData();
        fd.append('image', formData.imageFile);
        await api.postForm(`/api/categories/${categoryId}/image`, fd);
        add('Image uploaded', 'success');
      }

      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // 4. Delete Handler
  async function deleteCategory(id) {
    
    try {
      await api.del(`/api/categories?id=${id}`);
      fetchList();
      add('Deleting category...', 'error', 1500);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Categories</h2>
        <button onClick={openCreate} className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 shadow-sm transition">
          + Add Category
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border bg-white p-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-sm">
        <div className="flex gap-4 w-full sm:w-auto">
            <select 
                className="rounded-md border px-3 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
                value={activeFilter} 
                onChange={(e) => setActiveFilter(e.target.value)}
            >
                <option value="">All Statuses</option>
                <option value="1">Active Only</option>
                <option value="0">Inactive Only</option>
            </select>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rows per page:</span>
            <select className="rounded-md border px-2 py-1" value={per} onChange={(e) => setPer(Number(e.target.value))}>
                {[10,20,50,100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left w-16">Image</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Order</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((c, i) => (
                  <tr key={c.id} className="hover:bg-blue-50 transition group">
                    <td className="px-4 py-2">
                        <div className="h-10 w-10 rounded border bg-gray-50 flex items-center justify-center overflow-hidden">
                            {c.image ? (
                                <img src={`${ASSET_BASE}/${c.image}`} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                            ) : (
                                <span className="text-xs text-gray-400">N/A</span>
                            )}
                        </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.display_order}</td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Edit">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => deleteCategory(c.id)} className="p-1.5 rounded hover:bg-red-100 text-red-500" title="Delete">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* Unified Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Add New Category' : 'Edit Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Name *</label>
                  <input 
                    className="w-full mt-1 rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Men's Clothing"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
               </div>

               <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Slug (Optional)</label>
                  <input 
                    className="w-full mt-1 rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. mens-clothing"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs font-semibold text-gray-500 uppercase">Display Order</label>
                       <input 
                         type="number"
                         className="w-full mt-1 rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formData.display_order}
                         onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                       />
                   </div>
                   <div className="flex items-end pb-2">
                       <label className="flex items-center cursor-pointer">
                           <input 
                             type="checkbox" 
                             className="w-5 h-5 text-blue-600 rounded"
                             checked={!!formData.is_active}
                             onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})}
                           />
                           <span className="ml-2 text-sm text-gray-700">Active Status</span>
                       </label>
                   </div>
               </div>

               {/* Image Upload Section */}
               <div className="border-t pt-4 mt-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Category Image</label>
                  <div className="flex items-center gap-4">
                      {/* Current Image Preview */}
                      {formData.image && !formData.imageFile && (
                          <div className="h-16 w-16 rounded border bg-gray-50 overflow-hidden shrink-0">
                              <img src={`${ASSET_BASE}/${formData.image}`} className="w-full h-full object-cover" alt="Current" />
                          </div>
                      )}
                      
                      {/* File Input */}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                        onChange={(e) => setFormData({...formData, imageFile: e.target.files?.[0] || null})}
                      />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                      {modalMode === 'edit' ? 'Upload a new file to replace the existing image.' : 'Upload an image for this category.'}
                  </p>
               </div>

               <div className="flex justify-end gap-3 mt-4 pt-4  border-t">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium">Cancel</button>
                  <button disabled={submitting} type="submit" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm disabled:opacity-50">
                      {submitting ? 'Saving...' : (modalMode === 'create' ? 'Create Category' : 'Save Changes')}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
