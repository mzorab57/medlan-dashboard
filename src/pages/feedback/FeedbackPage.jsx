import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

// ─── Icons ───────────────────────────────────────────────────────
function IconStar({ filled, half }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconSearch() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
}
function IconMessageSquare() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
}
function IconUser() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconX() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>);
}
function IconClock() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
}
function IconSend() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>);
}

export default function FeedbackPage() {
  const { add } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [createData, setCreateData] = useState({
    customer_name: '',
    rating: '5',
    comment: '',
  });

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

  function handleSelectProduct(p) {
    setSelectedProduct({ id: p.id, name: p.name });
    setProductSearch(p.name);
    setDropdownOpen(false);
    setItems([]);
    fetchList(p.id);
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = productSearch.trim();
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

  async function toggleStatus(id, currentStatus) {
    const endpoint = currentStatus ? 'unapprove' : 'approve';
    try {
      await api.patch(`/api/feedback/${endpoint}?id=${id}`, {});
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_approved: !currentStatus } : item
      ));
      add(`Feedback ${currentStatus ? 'Hidden' : 'Published'}`, 'success');
    } catch (e) {
      add(e.message, 'error');
      fetchList(selectedProduct?.id);
    }
  }

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
      add('Feedback created', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  const averageRating = items.length ? (items.reduce((a, b) => a + b.rating, 0) / items.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
            <IconMessageSquare />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Product Feedback
            </h1>
            <p className="text-sm text-muted mt-0.5">Manage reviews and ratings</p>
          </div>
        </div>

        {/* ─── SEARCH & ADD PANEL ─────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-5 shadow-sm space-y-5">
          {/* Search */}
          <div className="relative max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <IconSearch />
            </div>
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all placeholder:text-slate-300"
              placeholder="Search for a product..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setDropdownOpen(true); }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            />
            {productLoading && (
              <div className="absolute right-3 top-3">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
            
            {dropdownOpen && productResults.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-auto z-20 py-1">
                {productResults.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2.5 hover:bg-primary/5 cursor-pointer text-sm text-slate-700 hover:text-primary transition-colors flex items-center justify-between group"
                    onMouseDown={() => handleSelectProduct(p)}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Form (Visible only when product selected) */}
          <div className={`transition-all duration-500 ease-in-out ${!selectedProduct ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Write Review For</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                {selectedProduct?.name || 'Select Product...'}
              </span>
            </div>
            
            <form onSubmit={submitCreate} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <div className="w-full md:w-1/4">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Customer</label>
                <input 
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Name" 
                  required
                  value={createData.customer_name} 
                  onChange={(e) => setCreateData(s => ({...s, customer_name: e.target.value}))} 
                />
              </div>
              <div className="w-full md:w-32">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Rating</label>
                <select 
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer" 
                  value={createData.rating} 
                  onChange={(e) => setCreateData(s => ({...s, rating: e.target.value}))}
                >
                  {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </div>
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Comment</label>
                <input 
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  placeholder="Share feedback..." 
                  value={createData.comment} 
                  onChange={(e) => setCreateData(s => ({...s, comment: e.target.value}))} 
                />
              </div>
              <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                <IconSend /> Submit
              </button>
            </form>
          </div>
        </div>

        {/* ─── FEEDBACK LIST ──────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              </div>
              <p className="text-sm text-muted animate-pulse">Loading reviews...</p>
            </div>
          ) : !selectedProduct ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
                <IconSearch />
              </div>
              <p className="font-medium text-slate-500">Select a product to view feedback</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary/30">
                <IconMessageSquare />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600 text-lg">No reviews yet</p>
                <p className="text-sm text-muted mt-1">Be the first to add feedback for this product</p>
              </div>
            </div>
          ) : (
            <div>
              {/* Stats Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-primary">{averageRating}</span>
                  <div className="flex text-amber-400">
                    {[1,2,3,4,5].map(i => <IconStar key={i} filled={i <= Math.round(averageRating)} />)}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-xs text-muted">
                  Based on <strong>{items.length}</strong> review{items.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-40">Customer</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Rating</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comment</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {items.map((f, idx) => (
                      <tr key={f.id} className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200" style={{ animationDelay: `${idx * 30}ms` }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-slate-100 text-slate-400">
                              <IconUser />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700">{f.customer_name}</div>
                              <div className="text-[10px] text-muted flex items-center gap-1">
                                <IconClock /> {new Date(f.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex text-amber-400">
                            {[1,2,3,4,5].map(i => (
                              <IconStar key={i} filled={i <= f.rating} />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 leading-relaxed italic">
                            "{f.comment || 'No written review.'}"
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            f.is_approved 
                            ? 'bg-accent/10 text-accent border border-accent/20' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {f.is_approved ? <IconCheck /> : <IconClock />}
                            {f.is_approved ? 'Public' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => toggleStatus(f.id, f.is_approved)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105 ${
                                f.is_approved 
                                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:shadow-red-500/10' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:shadow-emerald-500/10'
                            }`}
                          >
                            {f.is_approved ? (
                              <><IconX /> Hide</>
                            ) : (
                              <><IconCheck /> Approve</>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}