import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { downloadCSV } from '../../lib/csv';
import { useToast } from '../../store/toast';

const statuses = ['', 'pending', 'processing', 'shipped', 'completed', 'cancelled', 'returned'];
const sources = ['', 'website', 'whatsapp', 'instagram'];

export default function SalesReportPage() {
  const { add } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [per, setPer] = useState(50);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [profitSummary, setProfitSummary] = useState({ website: 0, whatsapp: 0, instagram: 0, total: 0 });
  const [exportLoading, setExportLoading] = useState(false);

  function formatNumber(n) {
    const x = Number(n || 0);
    return x.toLocaleString();
  }


  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (source) params.set('source', source);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await api.get(`/api/reports/sales-stats?${params.toString()}`);
      const data = res.data || res;
      setProfitSummary({
        website: Number(data.website_profit || 0),
        whatsapp: Number(data.whatsapp_profit || 0),
        instagram: Number(data.instagram_profit || 0),
        total: Number(data.total_profit || 0),
      });
    } catch {
      setProfitSummary({ website: 0, whatsapp: 0, instagram: 0, total: 0 });
    }
  }, [status, source, from, to]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(per));
      if (status) params.set('status', status);
      if (source) params.set('source', source);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await api.get(`/api/reports/sales?${params.toString()}`);
      const list = res.data || res;
      setItems(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, per, status, source, from, to]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function exportCSV() {
    try {
      setExportLoading(true);
      const rows = [];
      let p = 1;
      while (true) {
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('per_page', '200');
        if (status) params.set('status', status);
        if (source) params.set('source', source);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const res = await api.get(`/api/reports/sales?${params.toString()}`);
        const chunk = res.data || res;
        if (!Array.isArray(chunk) || chunk.length === 0) break;
        rows.push(...chunk);
        if (chunk.length < 200) break;
        p += 1;
      }
      downloadCSV('sales-report.csv', rows, [
        { header: 'Order ID', key: 'order_id' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Phone', key: 'phone_number' },
        { header: 'Status', key: 'order_status' },
        { header: 'Source', key: 'order_source' },
        { header: 'Date', key: 'order_date' },
        { header: 'Item ID', key: 'order_item_id' },
        { header: 'Product', key: 'product_name' },
        { header: 'Code', key: 'product_code' },
        { header: 'Qty', key: 'quantity' },
        { header: 'Original', key: 'original_price' },
        { header: 'Discount', key: 'discount_amount' },
        { header: 'Sale Price', key: 'sale_price' },
        { header: 'Cost', key: 'purchase_cost' },
        { header: 'Profit/Unit', key: 'profit_per_unit' },
        { header: 'Total Profit', key: 'total_profit' },
        { header: 'Total Sale', key: 'total_sale_amount' },
        { header: 'Promotion', key: 'promotion_used' },
      ]);
      add('CSV exported', 'success');
    } catch (e) {
      setError(e.message);
      add(e.message, 'error');
    } finally {
      setExportLoading(false);
    }
  }

  function applyFilters(e) {
    e.preventDefault();
    setPage(1);
    fetchList();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sales Report</h2>
      </div>
      <form onSubmit={applyFilters} className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select className="rounded-md border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select className="rounded-md border px-3 py-2" value={source} onChange={(e) => setSource(e.target.value)}>
          {sources.map((s) => <option key={s} value={s}>{s || 'All Sources'}</option>)}
        </select>
        <input type="date" className="rounded-md border px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="rounded-md border px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex gap-2">
          {/*  jarek am button ba commet bet eshm pei nia */}
          {/* <button type="submit" className="rounded-md bg-gray-900 text-white px-3 py-2">Apply</button> */}
          <select className="rounded-md border px-2" value={per} onChange={(e) => setPer(Number(e.target.value))}>
            {[50,100,200].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
          <button type="button" className="rounded-md border whitespace-nowrap px-3 py-2" onClick={exportCSV} disabled={exportLoading}>
            {exportLoading ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
       
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border  p-4">
          <div className="text-xs text-blue-500 bg-blue-100 w-fit rounded px-2 p-1">Website Profit</div>
          <div className="text-xl text-blue-400 font-semibold">{formatNumber(profitSummary.website)}</div>
        </div>
        <div className="rounded-xl border  p-4">
          <div className="text-xs text-green-500  bg-green-100 w-fit rounded px-2 p-1">WhatsApp Profit</div>
          <div className="text-xl font-semibold text-green-400">{formatNumber(profitSummary.whatsapp)}</div>
        </div>
        <div className="rounded-xl border  p-4">
          <div className="text-xs text-orange-500 bg-orange-100 px-2 w-fit rounded p-1">Instagram Profit</div>
          <div className="text-xl font-semibold text-orange-400">{formatNumber(profitSummary.instagram)}</div>
        </div>
        <div className="rounded-xl border  p-4">
          <div className="text-xs text-indigo-500 bg-indigo-100 w-fit rounded px-2 p-1">Total Profit</div>
          <div className="text-xl font-semibold text-indigo-400">{formatNumber(profitSummary.total)}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-600">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Order</th>
                <th className="text-left px-3 py-2">Customer</th>
                <th className="text-left px-3 py-2">Phone</th>
                <th className="text-left px-3 py-2">Status</th>
                <th className="text-left px-3 py-2">Source</th>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Product</th>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">Qty</th>
                <th className="text-left px-3 py-2">Original</th>
                <th className="text-left px-3 py-2">Discount</th>
                <th className="text-left px-3 py-2">Sale</th>
                <th className="text-left px-3 py-2">Cost</th>
                <th className="text-left px-3 py-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{r.order_id}</td>
                  <td className="px-3 py-2">{r.customer_name}</td>
                  <td className="px-3 py-2">{r.phone_number}</td>
                  <td className="px-3 py-2">{r.order_status}</td>
                  <td className="px-3 py-2">{r.order_source}</td>
                  <td className="px-3 py-2">{r.order_date}</td>
                  <td className="px-3 py-2">{r.product_name}</td>
                  <td className="px-3 py-2">{r.product_code}</td>
                  <td className="px-3 py-2">{r.quantity}</td>
                  <td className="px-3 py-2">{r.original_price}</td>
                  <td className="px-3 py-2">{r.discount_amount}</td>
                  <td className="px-3 py-2">{r.sale_price}</td>
                  <td className="px-3 py-2">{r.purchase_cost}</td>
                  <td className="px-3 py-2">{r.total_profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page}</div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded border" disabled={page<=1} onClick={() => setPage((p) => Math.max(1, p-1))}>Prev</button>
          <button className="px-3 py-2 rounded border" onClick={() => setPage((p) => p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
