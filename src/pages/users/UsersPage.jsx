import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

export default function UsersPage() {
  const { add } = useToast();

  // --- Main State ---
  const [items, setItems] = useState([]);
  
  // --- Filters ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // '1' or '0'

  // --- Modal State (Combined Create & Edit) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState({
    id: null,
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'employee',
    is_active: 1,
  });

  // 1. Fetch Users List
  const fetchList = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '20');
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter) params.set('role', roleFilter);
      if (activeFilter !== '') params.set('is_active', activeFilter); // Assuming API supports this

      const res = await api.get(`/api/users?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) {
      add(e.message, 'error');
    }
  }, [page, search, roleFilter, activeFilter, add]);

  // Debounce Search Effect
  useEffect(() => {
    const t = setTimeout(() => {
      fetchList();
    }, 10); // faster debounce for quicker fetch
    return () => clearTimeout(t);
  }, [fetchList]);

  // 2. Form Handling
  function openCreate() {
    setModalMode('create');
    setFormData({ id: null, username: '', email: '', password: '', phone: '', role: 'employee', is_active: 1 });
    setModalOpen(true);
  }

  function openEdit(user) {
    setModalMode('edit');
    setFormData({
      id: user.id,
      username: user.username,
      email: user.email,
      password: '', // Password empty on edit
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active ? 1 : 0,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone || undefined,
        role: formData.role,
        is_active: Number(formData.is_active),
      };

      // Only add password if it's set (Create mode) or changed (Edit mode)
      if (formData.password) {
        payload.password = formData.password;
      }

      if (modalMode === 'create') {
        await api.post('/api/users', payload);
        add('User created successfully', 'success');
      } else {
        await api.patch(`/api/users?id=${formData.id}`, payload);
        add('User updated successfully', 'success');
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    }
  }

  // 3. Delete Action
  async function deleteUser(id) {
    try {
      await api.del(`/api/users?id=${id}`);
      fetchList();
      add('Deleting user...', 'error', 1500);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">User Management</h2>
        <button onClick={openCreate} className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 shadow-sm transition">
          + Add User
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-sm">
        <div className="relative md:col-span-2">
            <input
            placeholder="Search by name, email or phone..."
            className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
        </div>
        
        <select className="rounded-md border px-3 py-2 bg-gray-50" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>

        <select className="rounded-md border px-3 py-2 bg-gray-50" value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">User</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Contact</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Last Login</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.username}</div>
                      <div className="text-xs text-gray-400">ID: #{u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                      <div className="text-gray-700">{u.email}</div>
                      <div className="text-xs text-gray-500">{u.phone || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                          {u.role.toUpperCase()}
                      </span>
                  </td>
                  <td className="px-4 py-3">
                       <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition" title="Edit">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded hover:bg-red-100 text-red-500 transition" title="Delete">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
            <button disabled={page<=1} onClick={() => setPage(p => p-1)} className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-sm">Previous</button>
            <span className="text-sm text-gray-600">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} className="px-3 py-1 border rounded bg-white text-sm">Next</button>
        </div>
      </div>

      {/* Unified Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" style={{marginTop:'0px'}}>
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase">Username</label>
                 <input className="w-full mt-1 rounded-md border px-3 py-2" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
              
              <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                 <input type="email" className="w-full mt-1 rounded-md border px-3 py-2" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase">Password {modalMode === 'edit' && '(Leave blank to keep current)'}</label>
                 <input type="password" className="w-full mt-1 rounded-md border px-3 py-2" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={modalMode === 'create'} />
              </div>

              <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                 <input className="w-full mt-1 rounded-md border px-3 py-2" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
                    <select className="w-full mt-1 rounded-md border px-3 py-2 bg-white" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={!!formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} />
                        <span className="ml-2 text-sm text-gray-700">Account Active</span>
                    </label>
                  </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button type="button" className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 font-medium" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm">
                    {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
