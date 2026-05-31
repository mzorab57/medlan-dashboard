import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

// ─── Icons ───────────────────────────────────────────────────────
function IconUsers() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
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
function IconSearch() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
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
function IconChevronDown() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
}
function IconShield() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
}
function IconUser() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
}
function IconMail() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>);
}
function IconPhone() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>);
}
function IconLock() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>);
}
function IconClock() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}

export default function UsersPage() {
  const { add } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null, username: '', email: '', password: '', phone: '', role: 'employee', is_active: 1,
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '20');
      if (search.trim()) params.set('search', search.trim());
      if (roleFilter) params.set('role', roleFilter);
      if (activeFilter !== '') params.set('is_active', activeFilter);
      const res = await api.get(`/api/users?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) { add(e.message, 'error'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter, activeFilter, add]);

  useEffect(() => {
    const t = setTimeout(() => fetchList(), 10);
    return () => clearTimeout(t);
  }, [fetchList]);

  function openCreate() {
    setModalMode('create');
    setFormData({ id: null, username: '', email: '', password: '', phone: '', role: 'employee', is_active: 1 });
    setModalOpen(true);
  }

  function openEdit(user) {
    setModalMode('edit');
    setFormData({
      id: user.id, username: user.username, email: user.email, password: '',
      phone: user.phone || '', role: user.role, is_active: user.is_active ? 1 : 0,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        username: formData.username, email: formData.email,
        phone: formData.phone || undefined, role: formData.role, is_active: Number(formData.is_active),
      };
      if (formData.password) payload.password = formData.password;
      if (modalMode === 'create') {
        await api.post('/api/users', payload);
        add('User created', 'success');
      } else {
        await api.patch(`/api/users?id=${formData.id}`, payload);
        add('User updated', 'success');
      }
      setModalOpen(false);
      fetchList();
    } catch (e) { add(e.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function deleteUser(id) {
    try {
      await api.del(`/api/users?id=${id}`);
      fetchList();
      add('User deleted', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  const adminCount = items.filter((u) => u.role === 'admin').length;
  const employeeCount = items.filter((u) => u.role === 'employee').length;
  const activeCount = items.filter((u) => u.is_active).length;

  function getInitials(name) {
    return (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);
  }

  const avatarColors = [
    'from-primary to-secondary',
    
   
  ];

  function getAvatarColor(id) {
    return avatarColors[(id || 0) % avatarColors.length];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
                <IconUsers />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{items.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                User Management
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                  <IconShield />
                  {adminCount} admin{adminCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                  <IconUser />
                  {employeeCount} employee{employeeCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1 text-xs text-accent font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {activeCount} active
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="group relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <IconPlus />
            <span>Add User</span>
          </button>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-center gap-2 flex-1 w-full">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <IconFilter />
              </div>

              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                  <IconSearch />
                </div>
                <input
                  placeholder="Search by name, email or phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all placeholder:text-slate-300"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Role Filter */}
              <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1">
                {[
                  { value: '', label: 'All Roles' },
                  { value: 'admin', label: 'Admin' },
                  { value: 'employee', label: 'Employee' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setRoleFilter(opt.value); setPage(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      roleFilter === opt.value
                        ? 'bg-white text-primary shadow-md shadow-primary/10 ring-1 ring-primary/10'
                        : 'text-muted hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      activeFilter === opt.value
                        ? 'bg-white text-primary shadow-md shadow-primary/10 ring-1 ring-primary/10'
                        : 'text-muted hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Users Table ────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-muted animate-pulse font-medium">Loading users...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary/30">
                <IconUsers />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600 text-lg">No users found</p>
                <p className="text-sm text-muted mt-1">Try adjusting your filters or create a new user</p>
              </div>
              <button
                onClick={openCreate}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <IconPlus /> Add User
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary/5 to-secondary/5">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">Role</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Login</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {items.map((u, idx) => (
                      <tr
                        key={u.id}
                        className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(u.id)} flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                              {getInitials(u.username)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">{u.username}</div>
                              <div className="text-[10px] text-muted font-mono">ID #{u.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <span className="text-muted"><IconMail /></span>
                              {u.email}
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-muted">
                                <IconPhone />
                                {u.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200/60 shadow-sm shadow-purple-100'
                              : 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20 shadow-sm shadow-primary/10'
                          }`}>
                            {u.role === 'admin' ? <IconShield /> : <IconUser />}
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            u.is_active
                             ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                          }`}>
                            {u.is_active ? (
                             <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><IconCheck /></span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-white"><IconX /></span>
                            )}
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted">
                            <IconClock />
                            {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                          </div>
                        </td>

                        {/* Actions — Always Visible */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 hover:scale-110"
                              title="Delete"
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

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {items.map((u, idx) => (
                  <div
                    key={u.id}
                    className="rounded-2xl border border-slate-200/60 bg-white p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarColor(u.id)} flex items-center justify-center text-white font-bold shadow-lg shrink-0`}>
                        {getInitials(u.username)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-800 truncate">{u.username}</div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm shadow-primary/10 transition-all"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10 transition-all"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                          <IconMail /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                            <IconPhone /> {u.phone}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}>
                            {u.role === 'admin' ? <IconShield /> : <IconUser />}
                            {u.role}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active
                              ? 'bg-accent/10 text-accent'
                              : 'bg-slate-100 text-muted'
                          }`}>
                            <span className={`w-1 h-1 rounded-full ${u.is_active ? 'bg-accent' : 'bg-slate-400'}`} />
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-100/80 bg-gradient-to-r from-primary/5 to-secondary/5 flex items-center justify-between">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:-translate-x-0.5"
                >
                  <IconChevronLeft /> Previous
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">
                    Page <span className="font-extrabold text-primary">{page}</span>
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-muted">{items.length} user{items.length !== 1 ? 's' : ''}</span>
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < 20}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:translate-x-0.5"
                >
                  Next <IconChevronRight />
                </button>
              </div>
            </>
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
                        {modalMode === 'create' ? 'New User' : 'Edit User'}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        {modalMode === 'create' ? 'Create a new user account' : `Editing: ${formData.username}`}
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
                {/* Username */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconUser /> Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all placeholder:text-slate-300"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconMail /> Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all placeholder:text-slate-300"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconLock /> Password
                    {modalMode === 'edit' && <span className="text-muted normal-case font-normal">(leave blank to keep)</span>}
                    {modalMode === 'create' && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={modalMode === 'create'}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <IconPhone /> Phone <span className="text-slate-300 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all placeholder:text-slate-300"
                    placeholder="+964 xxx xxx xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Role & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      <IconShield /> Role
                    </label>
                    <div className="relative">
                      <select
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-slate-300 transition-all appearance-none cursor-pointer"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                        <IconChevronDown />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end pb-1">
                    <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50 w-full">
                      <label className="relative inline-flex items-center gap-3 cursor-pointer group w-full">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-emerald-500 transition-colors duration-300" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-600">{formData.is_active ? 'Active' : 'Inactive'}</span>
                          <p className="text-[9px] text-muted">Can login</p>
                        </div>
                      </label>
                    </div>
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
                      ) : modalMode === 'create' ? 'Create User' : 'Save Changes'}
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