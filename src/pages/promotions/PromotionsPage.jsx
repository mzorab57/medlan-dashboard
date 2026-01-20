import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

export default function PromotionsPage() {
  const { add } = useToast();
  
  // --- Main List State ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Filters ---
  const [activeFilter, setActiveFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // --- Modal States ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    is_active: 1,
    priority: 0,
  });

  // --- Manage Items State ---
  const [manageId, setManageId] = useState(null);
  const [manageData, setManageData] = useState(null); // { promotion: {}, items: [] }
  const [manageLoading, setManageLoading] = useState(false);
  
  // --- Manage: Search & Add Logic ---
  const [specSearch, setSpecSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Products
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // If set, we show specs for this product
  const [productSpecs, setProductSpecs] = useState([]);

  // 1. Fetch Promotions List
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== '') params.set('active', activeFilter);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      
      const res = await api.get(`/api/promotions?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 2. Form Handling (Create & Edit)
  function openCreate() {
    setModalMode('create');
    setFormData({
      id: null, name: '', description: '', discount_type: 'percentage',
      discount_value: '', start_date: '', end_date: '', is_active: 1, priority: 0
    });
    setModalOpen(true);
  }

  function openEdit(p) {
    setModalMode('edit');
    setFormData({
      id: p.id,
      name: p.name,
      description: p.description || '',
      discount_type: p.discount_type,
      discount_value: p.discount_value,
      start_date: p.start_date,
      end_date: p.end_date,
      is_active: p.is_active,
      priority: p.priority || 0,
    });
    setModalOpen(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        discount_type: formData.discount_type === 'amount' ? 'fixed' : formData.discount_type,
        discount_value: Number(formData.discount_value),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: Number(formData.is_active),
        priority: Number(formData.priority),
      };

      if (modalMode === 'create') {
        await api.post('/api/promotions', payload);
        add('Promotion created successfully', 'success');
      } else {
        await api.patch(`/api/promotions?id=${formData.id}`, payload);
        add('Promotion updated successfully', 'success');
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  // 3. Actions
  async function toggleActive(p) {
    try {
      await api.patch(`/api/promotions?id=${p.id}`, { is_active: p.is_active ? 0 : 1 });
      fetchList(); // Refresh list
      add(p.is_active ? 'Deactivated' : 'Activated', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function deletePromotion(id) {
    try {
      await api.del(`/api/promotions?id=${id}`);
      fetchList();
     add('Deleting promotion...', 'error', 1500);
    } catch (e) { add(e.message, 'error'); }
  }

  // 4. Manage Items Logic
  async function openManage(id) {
    setManageId(id);
    setManageLoading(true);
    // Reset search states
    setSpecSearch('');
    setSearchResults([]);
    setSelectedProduct(null);
    try {
      const res = await api.get(`/api/promotions?id=${id}`);
      setManageData(res);
    } catch (e) { add(e.message, 'error'); }
    finally { setManageLoading(false); }
  }

  async function refreshManage() {
    if (!manageId) return;
    const res = await api.get(`/api/promotions?id=${manageId}`);
    setManageData(res);
  }

  // Search Products
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!specSearch.trim()) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const res = await api.get(`/api/products?search=${specSearch}&per_page=5`);
        setSearchResults(res.data || res || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400); // Debounce
    return () => clearTimeout(t);
  }, [specSearch]);

  // Load specs when a product is clicked
  async function selectProductForSpecs(prod) {
    setSelectedProduct(prod);
    try {
      const res = await api.get(`/api/products/${prod.id}/specs`);
      setProductSpecs(res.data || res || []);
    } catch { setProductSpecs([]); }
  }

  // Add Item
  async function addItem(specId) {
    try {
      await api.post(`/api/promotions/${manageId}/items`, { product_spec_id: Number(specId) });
      refreshManage();
      add('Item added', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  // Remove Item
  async function removeItem(specId) {
    try {
      await api.del(`/api/promotions/${manageId}/items?spec_id=${specId}`);
      refreshManage();
      add('Deleting item...', 'error', 1500);
    } catch (e) { add(e.message, 'error'); }
  }


  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Promotions</h2>
        <button onClick={openCreate} className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition shadow-sm">
          + New Promotion
        </button>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-sm">
        <select className="rounded-md border px-3 py-2 bg-gray-50" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="1">Active Only</option>
          <option value="0">Inactive Only</option>
        </select>
        <input type="date" className="rounded-md border px-3 py-2 bg-gray-50" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="rounded-md border px-3 py-2 bg-gray-50" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button className="rounded-md border px-3 py-2 hover:bg-gray-100" onClick={() => { setActiveFilter(''); setDateFrom(''); setDateTo(''); }}>
          Clear Filters
        </button>
      </div>

      {/* LIST TABLE */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading promotions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Discount</th>
                  <th className="px-4 py-3 text-left">Duration</th>
                  <th className="px-4 py-3 text-left">Priority</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((p,i) => (
                  <tr key={p.id} className="hover:bg-blue-50 transition cursor-pointer" onClick={() => openManage(p.id)}>
                    <td className="px-4 py-3 font-medium text-gray-500">{i+1}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${p.discount_type === 'percentage' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                        {p.discount_value}{p.discount_type === 'percentage' ? '%' : ' IQD'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {p.start_date} <span className="text-gray-400">to</span> {p.end_date}
                    </td>
                    <td className="px-4 py-3">{p.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Edit" onClick={() => openEdit(p)}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Toggle Active" onClick={() => toggleActive(p)}>
                           <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${p.is_active ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </button>
                        <button className="p-1.5 rounded hover:bg-red-100 text-red-500" title="Delete" onClick={() => deletePromotion(p.id)}>
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
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" style={{marginTop:'0px'}}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">{modalMode === 'create' ? 'Create Promotion' : 'Edit Promotion'}</h3>
            <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Name</label>
                <input className="w-full rounded-md border px-3 py-2" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <select className="w-full rounded-md border px-3 py-2" value={formData.discount_type} onChange={(e) => setFormData({...formData, discount_type: e.target.value})}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Value</label>
                <input type="number" step="0.01" className="w-full rounded-md border px-3 py-2" value={formData.discount_value} onChange={(e) => setFormData({...formData, discount_value: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input type="date" className="w-full rounded-md border px-3 py-2" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                <input type="date" className="w-full rounded-md border px-3 py-2" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Description</label>
                <input className="w-full rounded-md border px-3 py-2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Priority</label>
                <input type="number" className="w-full rounded-md border px-3 py-2" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} />
              </div>
              <div className="flex items-center mt-6">
                 <input id="active_chk" type="checkbox" className="h-4 w-4" checked={!!formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} />
                 <label htmlFor="active_chk" className="ml-2 text-sm text-gray-700">Is Active?</label>
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE ITEMS MODAL (FULL SCREENISH) */}
      {manageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" style={{marginTop:'0px'}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
               <div>
                  <h3 className="text-lg font-bold">Manage Promotion Items</h3>
                  <div className="text-sm text-gray-500">{manageData?.promotion?.name}</div>
               </div>
               <button onClick={() => setManageId(null)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* LEFT: CURRENT ITEMS */}
                <div className="flex-1 overflow-y-auto p-4 border-r border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 sticky top-0 bg-white z-10">
                        Included Items ({manageData?.items?.length || 0})
                    </h4>
                    {manageLoading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : (manageData?.items || []).length === 0 ? (
                        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">No items in this promotion yet.</div>
                    ) : (
                        <div className="space-y-2">
                           {manageData.items.map(it => (
                               <div key={it.id || it.product_spec_id} className="flex items-center justify-between p-3 rounded border hover:shadow-sm bg-white">
                                   <div>
                                       <div className="font-medium text-sm">{it.product_name}</div>
                                       <div className="text-xs text-gray-500">
                                           {it.color_name} / {it.size_name} <span className="mx-1">•</span> Price: {it.price?.toLocaleString()}
                                       </div>
                                   </div>
                                   <button onClick={() => removeItem(it.product_spec_id || it.id)} className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-100 hover:bg-red-50">
                                       Remove
                                   </button>
                               </div>
                           ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: ADD ITEMS */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Add New Items</h4>
                    
                    {/* Search Bar */}
                    <div className="mb-4">
                        <input 
                           className="w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Search products by name..."
                           value={specSearch}
                           onChange={(e) => setSpecSearch(e.target.value)}
                           autoFocus
                        />
                    </div>

                    {/* Search Results */}
                    <div className="space-y-2">
                        {searchLoading && <div className="text-xs text-gray-500">Searching...</div>}
                        
                        {/* VIEW 1: PRODUCT LIST */}
                        {!selectedProduct && searchResults.map(p => (
                            <div key={p.id} 
                                 className="flex items-center justify-between p-3 bg-white rounded border cursor-pointer hover:border-blue-400 hover:shadow-sm"
                                 onClick={() => selectProductForSpecs(p)}
                            >
                                <span className="text-sm font-medium">{p.name}</span>
                                <span className="text-xs text-blue-600">View Specs &rarr;</span>
                            </div>
                        ))}

                        {/* VIEW 2: SPECS LIST */}
                        {selectedProduct && (
                            <div>
                                <button onClick={() => { setSelectedProduct(null); setProductSpecs([]); }} className="text-xs text-gray-500 mb-2 flex items-center hover:text-gray-800">
                                    &larr; Back to Products
                                </button>
                                <div className="font-bold text-sm mb-2">{selectedProduct.name}</div>
                                {productSpecs.length === 0 ? <div className="text-xs">No specs found.</div> : (
                                    <div className="space-y-2">
                                        {productSpecs.map(sp => {
                                            const isAdded = manageData?.items?.some(i => (i.product_spec_id || i.id) === sp.id);
                                            return (
                                                <div key={sp.id} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                                                    <div>
                                                        <div className="text-xs font-semibold">{sp.color_name} - {sp.size_name}</div>
                                                        <div className="text-xs text-gray-500">Stock: {sp.stock} • Price: {Number(sp.price).toLocaleString()}</div>
                                                    </div>
                                                    {isAdded ? (
                                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Added</span>
                                                    ) : (
                                                        <button onClick={() => addItem(sp.id)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Add</button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* Footer */}
            <div className="p-4 border-t bg-white flex justify-end">
                <button onClick={() => setManageId(null)} className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}