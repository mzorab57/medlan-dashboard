import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

// Helper function for Category Icons
const getCategoryIcon = (category) => {
  switch (category) {
    case 'utilities': return <span className="p-2 rounded-lg bg-yellow-100 text-yellow-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>;
    case 'rent': return <span className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></span>;
    case 'salary': return <span className="p-2 rounded-lg bg-green-100 text-green-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></span>;
    case 'marketing': return <span className="p-2 rounded-lg bg-purple-100 text-purple-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg></span>;
    case 'transport': return <span className="p-2 rounded-lg bg-blue-100 text-blue-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 02-1-1H4.5A2.25 2.25 0 002.25 9v5.5a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25V16" /></svg></span>;
    case 'delivery': return <span className="p-2 rounded-lg bg-cyan-100 text-cyan-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h11v10H3V7zm11 4h3l3 3v3h-6v-6zm2 8a2 2 0 104 0 2 2 0 00-4 0zM5 19a2 2 0 104 0 2 2 0 00-4 0z" /></svg></span>;
    default: return <span className="p-2 rounded-lg bg-gray-100 text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></span>;
  }
};

export default function ExpensesPage() {
  const { add } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Date Filters
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1); 
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const [summary, setSummary] = useState({ total: 0 });
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState({ title: '', amount: '', category: '', note: '', date: '' });
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchList() {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await api.get(`/api/expenses?${q.toString()}`);
      const list = Array.isArray(res.data || res) ? (res.data || res) : [];
      setItems(list);
      const sum = list.reduce((a, x) => a + Number(x.amount || 0), 0);
      setSummary({ total: sum });
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  function updateEdit(k, v) { setEdit((s) => ({ ...s, [k]: v })); }

  function openCreate() {
    setEditingId(null);
    setEdit({ title: '', amount: '', category: 'general', note: '', date: '' });
    setModalOpen(true);
  }

  async function deleteExpense(id) {
    if(!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.del(`/api/expenses?id=${id}`);
      add('Expense deleted', 'success');
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  function startEdit(x) {
    setEditingId(x.id);
    setEdit({
      title: x.title || '',
      amount: String(x.amount ?? ''),
      category: x.category || '',
      note: x.note || '',
      date: (x.created_at || '').slice(0, 10) || '',
    });
    setModalOpen(true);
  }

  async function saveEdit() {
    try {
      if (editingId) {
        const payload = {
          title: edit.title,
          amount: Number(edit.amount || 0),
          category: edit.category || 'general',
          note: edit.note || undefined,
          created_at: edit.date || undefined,
        };
        await api.patch(`/api/expenses?id=${editingId}`, payload);
        add('Expense updated successfully', 'success');
      } else {
        const payload = {
          title: edit.title,
          amount: Number(edit.amount || 0),
          category: edit.category || 'general',
          note: edit.note || undefined,
          date: edit.date || undefined,
        };
        await api.post('/api/expenses', payload);
        add('Expense added successfully', 'success');
      }
      setEditingId(null);
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
           <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Expense Tracker</h2>
           <p className="text-gray-500 mt-1">Monitor your spending and keep your budget on track.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700 shadow-sm" onClick={openCreate}>+ Create Expense</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* Filters & Stats Bar */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                
                {/* Date Filter */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                    <div className="relative w-full sm:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase pointer-events-none">From</span>
                        <input type="date" className="pl-12 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
                    </div>
                    <span className="text-gray-300 hidden sm:block">→</span>
                    <div className="relative w-full sm:w-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase pointer-events-none">To</span>
                        <input type="date" className="pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full" value={to} onChange={(e) => setTo(e.target.value)} />
                    </div>
                    <button onClick={fetchList} className="w-full sm:w-auto bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-semibold transition">
                        Filter
                    </button>
                </div>

                {/* Total Summary */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-rose-50 to-white px-5 py-3 rounded-xl border border-rose-100 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Total Spent</span>
                    <span className="text-2xl font-black text-rose-600 tracking-tight">
                        {summary.total.toLocaleString()} <span className="text-sm font-medium text-rose-400">IQD</span>
                    </span>
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Expense Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading data...</td></tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            <p className="text-sm">No expenses recorded for this period.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((x) => (
                                    <tr key={x.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">{x.title}</p>
                                            {x.note && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{x.note}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getCategoryIcon(x.category)}
                                                <span className="text-sm font-medium text-gray-600 capitalize">{x.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-sm whitespace-nowrap">
                                                - {Number(x.amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                                            {x.created_at?.slice(0, 10)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2  transition-opacity">
                                                <button onClick={() => startEdit(x)} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm text-gray-500 hover:text-indigo-600 transition">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => deleteExpense(x.id)} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm text-gray-500 hover:text-rose-600 transition">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN removed; creation handled via modal */}
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-0 overflow-hidden transform scale-100 transition-all">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Expense' : 'Create Expense'}</h3>
                <button onClick={() => { setModalOpen(false); setEditingId(null); }} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition">
                    &times;
                </button>
            </div>
            
            <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</label>
                  <input className="w-full border-gray-200 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={edit.title} onChange={(e) => updateEdit('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amount</label>
                        <input className="w-full border-gray-200 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" type="number" step="0.01" value={edit.amount} onChange={(e) => updateEdit('amount', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Category</label>
                        <select className="w-full border-gray-200 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={edit.category} onChange={(e) => updateEdit('category', e.target.value)}>
                                <option value="general">General</option>
                                <option value="utilities">Utilities</option>
                                <option value="rent">Rent</option>
                                <option value="supplies">Supplies</option>
                                <option value="salary">Salary</option>
                                <option value="marketing">Marketing</option>
                                <option value="transport">Transport</option>
                                <option value="delivery">Delivery</option>
                                <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Note</label>
                  <textarea rows="3" className="w-full border-gray-200 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={edit.note} onChange={(e) => updateEdit('note', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date</label>
                  <input className="w-full border-gray-200 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" type="date" value={edit.date} onChange={(e) => updateEdit('date', e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-medium text-sm transition" onClick={() => { setModalOpen(false); setEditingId(null); }}>Cancel</button>
                <button className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm shadow-sm transition" onClick={saveEdit}>{editingId ? 'Save Changes' : 'Create Expense'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
