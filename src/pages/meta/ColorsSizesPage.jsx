import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

export default function ColorsSizesPage() {
  const { add } = useToast();
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [cLoading, setCLoading] = useState(true);
  const [sLoading, setSLoading] = useState(true);
  const [cForm, setCForm] = useState({ name: '', hexa_number: '#000000', is_active: 1 });
  const [sForm, setSForm] = useState({ name: '', is_active: 1 });

  const fetchColors = useCallback(async () => {
    setCLoading(true);
    try {
      const res = await api.get('/api/colors');
      setColors(res.data || res);
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setCLoading(false);
    }
  }, [add]);

  const fetchSizes = useCallback(async () => {
    setSLoading(true);
    try {
      const res = await api.get('/api/sizes');
      setSizes(res.data || res);
    } catch (e) {
      add(e.message, 'error');
    } finally {
      setSLoading(false);
    }
  }, [add]);

  useEffect(() => {
    fetchColors();
    fetchSizes();
  }, [fetchColors, fetchSizes]);

  async function createColor(e) {
    e.preventDefault();
    try {
      const payload = { name: cForm.name, hexa_number: cForm.hexa_number, is_active: Number(cForm.is_active) };
      await api.post('/api/colors', payload);
      setCForm({ name: '', hexa_number: '#000000', is_active: 1 });
      await fetchColors();
      add('Color created', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }
  async function createSize(e) {
    e.preventDefault();
    try {
      const payload = { name: sForm.name, is_active: Number(sForm.is_active) };
      await api.post('/api/sizes', payload);
      setSForm({ name: '', is_active: 1 });
      await fetchSizes();
      add('Size created', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }

  async function saveColor(c) {
    try {
      const payload = {
        name: c.name,
        hexa_number: c.hexa_number,
        is_active: Number(c.is_active ? 1 : 0),
      };
      await api.patch(`/api/colors?id=${c.id}`, payload);
      await fetchColors();
      add('Color updated', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }
  async function saveSize(s) {
    try {
      const payload = {
        name: s.name,
        is_active: Number(s.is_active ? 1 : 0),
      };
      await api.patch(`/api/sizes?id=${s.id}`, payload);
      await fetchSizes();
      add('Size updated', 'success');
    } catch (e) {
      add(e.message, 'error');
    }
  }
  async function deleteColor(id) {
    
    try {
      await api.del(`/api/colors?id=${id}`);
      await fetchColors();
     add('Deleting color...', 'error', 1500);
    } catch (e) {
      add(e.message, 'error');
    }
  }
  async function deleteSize(id) {
    
    try {
      await api.del(`/api/sizes?id=${id}`);
      await fetchSizes();
     add('Deleting size...', 'error', 1500);
    } catch (e) {
      add(e.message, 'error');
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Colors & Sizes</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-4">
          <div className="text-lg font-semibold mb-3">Colors</div>
          <form onSubmit={createColor} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input className="rounded-md border px-3 py-2" placeholder="Name" value={cForm.name} onChange={(e) => setCForm((s) => ({ ...s, name: e.target.value }))} required />
            <input className="rounded-md border px-3 py-2 h-10" type="color" value={cForm.hexa_number} onChange={(e) => setCForm((s) => ({ ...s, hexa_number: e.target.value }))} />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!cForm.is_active} onChange={(e) => setCForm((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} />
              <span className="text-sm">Active</span>
            </label>
            <div className="md:col-span-3 flex justify-end">
              <button className="rounded bg-blue-600 text-white px-3 py-2">Create Color</button>
            </div>
          </form>
          <div className="overflow-x-auto">
            {cLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Color</th>
                    <th className="text-left px-3 py-2">Active</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colors.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2">
                        <input className="rounded border px-2 py-1 w-40" value={c.name || ''} onChange={(e) => setColors((list) => list.map((x) => x.id === c.id ? { ...x, name: e.target.value } : x))} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input type="color" className="h-9 w-12 rounded border" value={c.hexa_number || '#000000'} onChange={(e) => setColors((list) => list.map((x) => x.id === c.id ? { ...x, hexa_number: e.target.value } : x))} />
                          <span className="font-mono">{c.hexa_number}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={!!c.is_active} onChange={(e) => setColors((list) => list.map((x) => x.id === c.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="px-2 py-1 rounded border" onClick={() => saveColor(c)}>Save</button>
                          <button className="px-2 py-1 rounded border border-red-500 text-red-600" onClick={() => deleteColor(c.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <div className="text-lg font-semibold mb-3">Sizes</div>
          <form onSubmit={createSize} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input className="rounded-md border px-3 py-2 md:col-span-2" placeholder="Name" value={sForm.name} onChange={(e) => setSForm((s) => ({ ...s, name: e.target.value }))} required />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!sForm.is_active} onChange={(e) => setSForm((s) => ({ ...s, is_active: e.target.checked ? 1 : 0 }))} />
              <span className="text-sm">Active</span>
            </label>
            <div className="md:col-span-3 flex justify-end">
              <button className="rounded bg-blue-600 text-white px-3 py-2">Create Size</button>
            </div>
          </form>
          <div className="overflow-x-auto">
            {sLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Active</th>
                    <th className="text-right px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">
                        <input className="rounded border px-2 py-1 w-40" value={s.name || ''} onChange={(e) => setSizes((list) => list.map((x) => x.id === s.id ? { ...x, name: e.target.value } : x))} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={!!s.is_active} onChange={(e) => setSizes((list) => list.map((x) => x.id === s.id ? { ...x, is_active: e.target.checked ? 1 : 0 } : x))} />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="px-2 py-1 rounded border" onClick={() => saveSize(s)}>Save</button>
                          <button className="px-2 py-1 rounded border border-red-500 text-red-600" onClick={() => deleteSize(s.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
