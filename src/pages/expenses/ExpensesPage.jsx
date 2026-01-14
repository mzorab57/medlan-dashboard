import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

export default function ExpensesPage() {
  const { add } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Date Filters
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start of month default
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Forms
  const [form, setForm] = useState({ title: '', amount: '', category: 'general', note: '', date: '' });
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

  function updateForm(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  function updateEdit(k, v) { setEdit((s) => ({ ...s, [k]: v })); }

  async function createExpense(e) {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        amount: Number(form.amount),
        category: form.category || 'general',
        note: form.note || undefined,
        date: form.date || undefined,
      };
      await api.post('/api/expenses', payload);
      add('Expense added successfully', 'success');
      setForm({ title: '', amount: '', category: 'general', note: '', date: '' });
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
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
    if (!editingId) return;
    try {
      const payload = {
        title: edit.title,
        amount: Number(edit.amount || 0),
        category: edit.category || 'general',
        note: edit.note || undefined,
        created_at: edit.date || undefined,
      };
      await api.patch(`/api/expenses?id=${editingId}`, payload);
      add('Expense updated successfully', 'success');
      setEditingId(null);
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Expenses</h2>
           <p className="text-sm text-gray-500">Manage your daily expenses and costs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: List & Filters */}
        <div className="lg:col-span-2 space-y-4">
            
            {/* Summary & Filters Card */}
            <div className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">From</label>
                            <input type="date" className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">To</label>
                            <input type="date" className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition text-sm font-medium" onClick={fetchList}>
                                Filter
                            </button>
                        </div>
                    </div>
                    
                    {/* Total Summary Badge */}
                    <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex flex-col items-end min-w-[150px]">
                        <span className="text-xs text-red-600 font-bold uppercase tracking-wider">Total Expenses</span>
                        <span className="text-xl font-bold text-red-700">{summary.total.toLocaleString()} IQD</span>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-gray-500">Loading expenses...</div>
                ) : items.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">No expenses found for this period.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                <tr>
                                    <th className="px-4 py-3">Expense</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Note</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((x) => (
                                    <tr key={x.id} className="hover:bg-red-50/30 transition group">
                                        <td className="px-4 py-3 font-medium text-gray-800">{x.title}</td>
                                        <td className="px-4 py-3 font-bold text-red-600">-{Number(x.amount).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                                {x.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{x.note || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">{x.created_at?.slice(0, 10)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(x)} className="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => deleteExpense(x.id)} className="p-1.5 rounded hover:bg-red-100 text-red-500" title="Delete">
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
        </div>

        {/* RIGHT COLUMN: Add Expense Form */}
        <div>
            <div className="rounded-xl border bg-white p-5 shadow-sm sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </span>
                    Add New Expense
                </h3>
                <form onSubmit={createExpense} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Title *</label>
                        <input className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Electricity Bill" value={form.title} onChange={(e) => updateForm('title', e.target.value)} required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Amount *</label>
                            <input type="number" step="0.01" className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="0.00" value={form.amount} onChange={(e) => updateForm('amount', e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Category</label>
                            <select className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                                <option value="general">General</option>
                                <option value="utilities">Utilities</option>
                                <option value="rent">Rent</option>
                                <option value="supplies">Supplies</option>
                                <option value="salary">Salary</option>
                                <option value="marketing">Marketing</option>
                                <option value="transport">Transport</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Note</label>
                        <textarea rows="2" className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Optional details..." value={form.note} onChange={(e) => updateForm('note', e.target.value)} />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Date</label>
                        <input type="date" className="w-full rounded-md border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" value={form.date} onChange={(e) => updateForm('date', e.target.value)} />
                        <p className="text-[10px] text-gray-400 mt-1">Leave blank for today</p>
                    </div>

                    <button className="w-full bg-gray-900 text-white rounded-lg px-4 py-2.5 hover:bg-gray-800 transition shadow-lg shadow-gray-200 font-medium">
                        Add Expense
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 transform transition-all">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Expense</h3>
                <button onClick={() => { setModalOpen(false); setEditingId(null); }} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Title</label>
                  <input className="w-full rounded-md border px-3 py-2" value={edit.title} onChange={(e) => updateEdit('title', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Amount</label>
                        <input className="w-full rounded-md border px-3 py-2" type="number" step="0.01" value={edit.amount} onChange={(e) => updateEdit('amount', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Category</label>
                        <select className="w-full rounded-md border px-3 py-2 bg-white" value={edit.category} onChange={(e) => updateEdit('category', e.target.value)}>
                                <option value="general">General</option>
                                <option value="utilities">Utilities</option>
                                <option value="rent">Rent</option>
                                <option value="supplies">Supplies</option>
                                <option value="salary">Salary</option>
                                <option value="marketing">Marketing</option>
                                <option value="transport">Transport</option>
                                <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Note</label>
                  <textarea rows="3" className="w-full rounded-md border px-3 py-2" value={edit.note} onChange={(e) => updateEdit('note', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Date</label>
                  <input className="w-full rounded-md border px-3 py-2" type="date" value={edit.date} onChange={(e) => updateEdit('date', e.target.value)} />
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium" onClick={() => { setModalOpen(false); setEditingId(null); }}>Cancel</button>
                <button className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}