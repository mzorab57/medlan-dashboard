import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, API_BASE } from '../../lib/api';
import { useToast } from '../../store/toast';

const ASSET_BASE = API_BASE.endsWith('/public') ? API_BASE.replace(/\/public$/, '') : `${API_BASE}/api`;

function assetUrl(path) {
  const rel = String(path || '').replace(/^\/+/, '');
  return rel ? `${ASSET_BASE}/${rel}` : '';
}

function IconImage() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconSave() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconArrowUp() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function IconArrowDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconGrip() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

export default function HeroBannersPage() {
  const { add } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingMap, setSavingMap] = useState({});
  const [uploadingMap, setUploadingMap] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [draggedId, setDraggedId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [createForm, setCreateForm] = useState({
    link_url: '',
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/hero-banners');
      setItems((res.data || res || []).map((item) => ({
        ...item,
        link_url: item.link_url || '',
        sort_order: Number(item.sort_order || 0),
        is_active: Number(item.is_active || 0),
      })));
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [add]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || Number(a.id) - Number(b.id)),
    [items],
  );

  function updateItem(id, patch) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function persistOrder(nextItems, successMessage = 'Banner order updated') {
    setItems(nextItems);
    setReordering(true);
    try {
      await Promise.all(
        nextItems.map((item) =>
          api.patch(`/api/hero-banners?id=${item.id}`, { sort_order: Number(item.sort_order || 0) })
        )
      );
      add(successMessage, 'success');
      fetchList();
    } catch (e) {
      add(e.message, 'error');
      fetchList();
    } finally {
      setReordering(false);
    }
  }

  async function createBanner(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const imageInput = form.elements.namedItem('image');
    const file = imageInput?.files?.[0];
    if (!file) {
      add('Image is required', 'error');
      return;
    }

    const fd = new FormData();
    const nextSortOrder = sortedItems.reduce(
      (maxOrder, item) => Math.max(maxOrder, Number(item.sort_order || 0)),
      0,
    ) + 1;
    fd.append('image', file, file.name);
    fd.append('link_url', createForm.link_url.trim());
    fd.append('sort_order', String(nextSortOrder));
    fd.append('is_active', '1');

    setCreating(true);
    try {
      await api.postForm('/api/hero-banners', fd);
      add('Banner created', 'success');
      setCreateForm({ link_url: '' });
      form.reset();
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setCreating(false);
    }
  }

  async function saveBanner(id) {
    const item = items.find((row) => row.id === id);
    if (!item) return;

    setSavingMap((prev) => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/api/hero-banners?id=${id}`, {
        link_url: item.link_url.trim(),
        sort_order: Number(item.sort_order || 0),
        is_active: Number(item.is_active ? 1 : 0),
      });
      add('Banner updated', 'success');
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setSavingMap((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function replaceImage(id, file) {
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file, file.name);

    setUploadingMap((prev) => ({ ...prev, [id]: true }));
    try {
      await api.postForm(`/api/hero-banners/${id}/image`, fd);
      add('Image replaced', 'success');
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setUploadingMap((prev) => ({ ...prev, [id]: false }));
    }
  }

  async function deleteBanner(id) {
    setDeletingId(id);
    try {
      await api.del(`/api/hero-banners?id=${id}`);
      add('Banner deleted', 'success');
      fetchList();
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setDeletingId(null);
    }
  }

  async function moveBanner(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= sortedItems.length) return;

    const reordered = [...sortedItems];
    const temp = reordered[index];
    reordered[index] = reordered[nextIndex];
    reordered[nextIndex] = temp;

    const withOrder = reordered.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));

    await persistOrder(withOrder);
  }

  function handleDragStart(id) {
    setDraggedId(id);
    setDropTargetId(id);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDropTargetId(null);
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (draggedId == null || draggedId === id) return;
    setDropTargetId(id);
  }

  async function handleDrop(e, targetId) {
    e.preventDefault();
    if (draggedId == null || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    const reordered = [...sortedItems];
    const fromIndex = reordered.findIndex((item) => item.id === draggedId);
    const toIndex = reordered.findIndex((item) => item.id === targetId);
    if (fromIndex === -1 || toIndex === -1) {
      handleDragEnd();
      return;
    }

    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const withOrder = reordered.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
    }));

    handleDragEnd();
    await persistOrder(withOrder, 'Banner moved');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary/70 font-semibold">Website Control</div>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Homepage Banners</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage hero images, click links, and display order for the homepage slider.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{sortedItems.length}</span>
            banners
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <IconImage />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add New Banner</h2>
                <p className="text-sm text-slate-500">Add image and link. Order and visibility can be adjusted later from the table.</p>
              </div>
            </div>
          </div>

          <form onSubmit={createBanner} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary"
                required
              />
            </div>

            <div className="lg:col-span-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Link
              </label>
              <input
                type="text"
                placeholder="/campaigns/black-friday"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={createForm.link_url}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, link_url: e.target.value }))}
              />
            </div>

            <div className="lg:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md disabled:opacity-60"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm">
                  <IconUpload />
                </span>
                {creating ? 'Uploading...' : 'Add Banner'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Banner Table</h2>
              <p className="text-sm text-slate-500">Change image, link, order, and visibility from one place.</p>
            </div>
            {reordering ? <span className="text-xs font-medium text-primary">Saving order...</span> : null}
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading banners...</div>
          ) : sortedItems.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">No banners yet. Upload your first homepage banner above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Drag</th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Preview</th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Link</th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Order</th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                    <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Replace Image</th>
                    <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`align-top transition-colors ${
                        draggedId === item.id ? 'opacity-50 bg-primary/5' : ''
                      } ${
                        dropTargetId === item.id && draggedId !== item.id ? 'bg-primary/10 ring-1 ring-inset ring-primary/20' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, item.id)}
                      onDrop={(e) => handleDrop(e, item.id)}
                    >
                      <td className="px-4 py-4">
                        <div
                          draggable={!reordering}
                          onDragStart={() => handleDragStart(item.id)}
                          onDragEnd={handleDragEnd}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 transition ${
                            reordering ? 'cursor-wait opacity-50' : 'cursor-grab active:cursor-grabbing hover:border-primary/30 hover:text-primary'
                          }`}
                          title="Drag to reorder"
                        >
                          <IconGrip />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                          {item.image ? (
                            <img src={assetUrl(item.image)} alt="" className="h-24 w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="h-24 w-full flex items-center justify-center text-slate-300">
                              <IconImage />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 min-w-[320px]">
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          value={item.link_url}
                          onChange={(e) => updateItem(item.id, { link_url: e.target.value })}
                          placeholder="/campaigns/black-friday"
                        />
                      </td>
                      <td className="px-4 py-4 min-w-[170px]">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            className="w-20 rounded-2xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={item.sort_order}
                            onChange={(e) => updateItem(item.id, { sort_order: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => moveBanner(index, -1)}
                            disabled={index === 0 || reordering}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                            title="Move up"
                          >
                            <IconArrowUp />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBanner(index, 1)}
                            disabled={index === sortedItems.length - 1 || reordering}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                            title="Move down"
                          >
                            <IconArrowDown />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 min-w-[120px]">
                        <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={!!item.is_active}
                            onChange={(e) => updateItem(item.id, { is_active: e.target.checked ? 1 : 0 })}
                          />
                          Active
                        </label>
                      </td>
                      <td className="px-4 py-4 min-w-[220px]">
                        <label className="block rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 cursor-pointer hover:border-primary/40 hover:text-primary transition">
                          <span className="inline-flex items-center gap-2">
                            <IconUpload />
                            {uploadingMap[item.id] ? 'Uploading...' : 'Choose new image'}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={!!uploadingMap[item.id]}
                            onChange={(e) => replaceImage(item.id, e.target.files?.[0])}
                          />
                        </label>
                      </td>
                      <td className="px-4 py-4 text-right min-w-[210px]">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => saveBanner(item.id)}
                            disabled={!!savingMap[item.id]}
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
                          >
                            <IconSave />
                            {savingMap[item.id] ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBanner(item.id)}
                            disabled={deletingId === item.id}
                            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                          >
                            <IconTrash />
                            {deletingId === item.id ? 'Deleting...' : ''}
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
    </div>
  );
}
