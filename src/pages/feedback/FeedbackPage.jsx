import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

export default function FeedbackPage() {
  const { add } = useToast();
  
  // Selection States
  const [selectedProduct, setSelectedProduct] = useState(null); // { id, name }
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search States
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form State
  const [createData, setCreateData] = useState({
    customer_name: '',
    rating: '5',
    comment: '',
  });

  // 1. Fetch Feedback List
  const fetchList = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/products/${id}/feedback`);
      setItems(res.data || res);
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Handle Product Selection (Fixing the main bug)
  function handleSelectProduct(p) {
    setSelectedProduct({ id: p.id, name: p.name });
    setProductSearch(p.name); // Set input to selected name
    setDropdownOpen(false);
    setItems([]); // Clear old list immediately
    fetchList(p.id); // <--- Auto load data here
  }

  // 3. Search Logic
  useEffect(() => {
    const t = setTimeout(async () => {
      const q = productSearch.trim();
      // If search matches selected product, don't search again
      if (!q || (selectedProduct && q === selectedProduct.name)) {
        setProductResults([]);
        return;
      }
      setProductLoading(true);
      try {
        const params = new URLSearchParams({ search: q, per_page: '5' });
        const res = await api.get(`/api/products?${params.toString()}`);
        setProductResults(res.data || res || []);
      } catch {
        setProductResults([]);
      } finally {
        setProductLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [productSearch, selectedProduct]);


  // 4. Actions (Approve/Unapprove)
  async function toggleStatus(id, currentStatus) {
    const endpoint = currentStatus ? 'unapprove' : 'approve';
    try {
      await api.patch(`/api/feedback/${endpoint}?id=${id}`, {}); // Assuming API structure
      // Optimistic update (faster UI)
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_approved: !currentStatus } : item
      ));
      add(`Feedback ${currentStatus ? 'Unapproved' : 'Approved'}`, 'success');
    } catch (e) {
      add(e.message, 'error');
      fetchList(selectedProduct?.id); // Revert on error
    }
  }

  // 5. Create Feedback
  async function submitCreate(e) {
    e.preventDefault();
    if (!selectedProduct?.id) {
        add('Please select a product first', 'error');
        return;
    }
    const payload = {
      customer_name: createData.customer_name,
      rating: Number(createData.rating),
      comment: createData.comment || undefined,
    };
    try {
      await api.post(`/api/products/${selectedProduct.id}/feedback`, payload);
      setCreateData({ customer_name: '', rating: '5', comment: '' });
      await fetchList(selectedProduct.id);
      add('Feedback created successfully', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Product Feedback</h2>

      {/* SECTION 1: SEARCH */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="max-w-md relative">
            <label className="text-xs text-gray-500 font-medium mb-1 block">Select Product</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Type to search..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            />
            {dropdownOpen && productResults.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-xl max-h-60 overflow-auto z-10">
                {productResults.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                    onMouseDown={() => handleSelectProduct(p)}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
            {productLoading && <div className="absolute right-3 top-9 text-xs text-gray-400">Loading...</div>}
        </div>
      </div>

      {/* SECTION 2: ADD FEEDBACK FORM */}
      <div className={`rounded-xl border bg-white p-5 shadow-sm transition-opacity ${!selectedProduct ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="text-sm font-bold text-gray-700 mb-3">
            Add Review for <span className="text-blue-600">{selectedProduct?.name || '...'}</span>
        </div>
        <form onSubmit={submitCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
             <input 
                className="w-full rounded-md border px-3 py-2 text-sm" 
                placeholder="Customer Name *" 
                required
                value={createData.customer_name} 
                onChange={(e) => setCreateData(s => ({...s, customer_name: e.target.value}))} 
             />
          </div>
          <div className="md:col-span-2">
            <select 
                className="w-full rounded-md border px-3 py-2 text-sm" 
                value={createData.rating} 
                onChange={(e) => setCreateData(s => ({...s, rating: e.target.value}))}
            >
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Stars {r===5 && '★'}</option>)}
            </select>
          </div>
          <div className="md:col-span-5">
            <input 
                className="w-full rounded-md border px-3 py-2 text-sm" 
                placeholder="Comment (Optional)" 
                value={createData.comment} 
                onChange={(e) => setCreateData(s => ({...s, comment: e.target.value}))} 
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full rounded bg-gray-900 text-white px-4 py-2 text-sm hover:bg-gray-800 transition">
                Submit
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: FEEDBACK LIST */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading reviews...</div>
        ) : !selectedProduct ? (
            <div className="p-8 text-center text-gray-400">Please select a product to view feedback.</div>
        ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No feedback found for this product yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{f.customer_name}</td>
                    <td className="px-4 py-3 text-yellow-500 tracking-widest">
                        {'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{f.comment || '—'}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${f.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {f.is_approved ? 'Published' : 'Pending'}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(f.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => toggleStatus(f.id, f.is_approved)}
                        className={`text-xs px-3 py-1 rounded border transition ${
                            f.is_approved 
                            ? 'border-red-200 text-red-600 hover:bg-red-50' 
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {f.is_approved ? 'Unapprove' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}