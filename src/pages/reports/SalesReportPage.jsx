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
      {/* <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Sales Report</h2>
      </div> */}
         {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Detailed breakdown of sales performance and profits.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             type="button" 
             className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-slate-200" 
             onClick={exportCSV} 
             disabled={exportLoading}
           >
            {exportLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Export CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* <form onSubmit={applyFilters} className="rounded-xl border bg-white p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select className="rounded-md border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select className="rounded-md border px-3 py-2" value={source} onChange={(e) => setSource(e.target.value)}>
          {sources.map((s) => <option key={s} value={s}>{s || 'All Sources'}</option>)}
        </select>
        <input type="date" className="rounded-md border px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="rounded-md border px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        <div className="flex gap-2">
         
          <select className="rounded-md border px-2" value={per} onChange={(e) => setPer(Number(e.target.value))}>
            {[50,100,200].map((n) => <option key={n} value={n}>{n}/page</option>)}
          </select>
          <button type="button" className="rounded-md border whitespace-nowrap px-3 py-2" onClick={exportCSV} disabled={exportLoading}>
            {exportLoading ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
       
      </form> */}
        {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          
          <div className='col-span-1'>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Status</label>
             <select className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
            </select>
          </div>

          <div className='col-span-1'>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Source</label>
             <select className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={source} onChange={(e) => setSource(e.target.value)}>
              {sources.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Sources'}</option>)}
            </select>
          </div>

          <div className='col-span-1'>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">From Date</label>
             <input type="date" className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>

          <div className='col-span-1'>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">To Date</label>
             <input type="date" className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className='col-span-1'>
             <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Rows</label>
             <select className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={per} onChange={(e) => setPer(Number(e.target.value))}>
              {[50,100,200].map((n) => <option key={n} value={n}>{n} rows</option>)}
            </select>
          </div>

          <div className='col-span-1'>
             <button type='button' onClick={() => {setPage(1); fetchList();}} className='w-full rounded-xl bg-slate-100 text-slate-600 font-semibold px-3 py-2.5 text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh Data
             </button>
          </div>
        </form>
      </div>


        {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Profit', value: profitSummary.total, color: 'indigo', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Website', value: profitSummary.website, color: 'blue', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
          { label: 'WhatsApp', value: profitSummary.whatsapp, color: 'emerald', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
          { label: 'Instagram', value: profitSummary.instagram, color: 'rose', icon: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 1.414 1.147 2.562 2.563 2.562.23 0 .453-.035.664-.1l1.188 1.188c.78.78 1.221 1.842 1.221 2.95 0 2.307-1.873 4.183-4.183 4.183h-.06c-1.106 0-2.168-.44-2.948-1.221L8.51 12.876c-.065.21-.1.433-.1.664 0 1.414 1.147 2.562 2.563 2.562.23 0 .453-.035.664-.1l1.188 1.188c.78.78 1.221 1.842 1.221 2.95 0 2.307-1.873 4.183-4.183 4.183h-.06c-1.106 0-2.168-.44-2.948-1.221l-5.613-5.613c-.78-.78-1.221-1.842-1.221-2.95 0-2.307 1.873-4.183 4.183-4.183h.06c1.106 0 2.168.44 2.948 1.221l5.613 5.613z' }, // Simplified generic icon
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:shadow-md transition">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className={`text-2xl font-bold text-${stat.color}-600`}>{formatNumber(stat.value)} <span className='text-xs text-gray-400'>IQD</span></h3>
            </div>
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
            </div>
          </div>
        ))}
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

// *******************************************





  // return (
  //   <div className="space-y-8 pb-10">
      
  //     {/* Header */}
  //     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  //       <div>
  //         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Analytics</h2>
  //         <p className="text-sm text-gray-500 mt-1">Detailed breakdown of sales performance and profits.</p>
  //       </div>
  //       <div className="flex items-center gap-2">
  //          <button 
  //            type="button" 
  //            className="inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-slate-200" 
  //            onClick={exportCSV} 
  //            disabled={exportLoading}
  //          >
  //           {exportLoading ? (
  //             <>
  //               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
  //               <span>Exporting...</span>
  //             </>
  //           ) : (
  //             <>
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
  //               <span>Export CSV</span>
  //             </>
  //           )}
  //         </button>
  //       </div>
  //     </div>

  //     {/* Stats Cards */}
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
  //       {[
  //         { label: 'Total Profit', value: profitSummary.total, color: 'indigo', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  //         { label: 'Website', value: profitSummary.website, color: 'blue', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  //         { label: 'WhatsApp', value: profitSummary.whatsapp, color: 'emerald', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  //         { label: 'Instagram', value: profitSummary.instagram, color: 'rose', icon: 'M11.35 3.836c-.065.21-.1.433-.1.664 0 1.414 1.147 2.562 2.563 2.562.23 0 .453-.035.664-.1l1.188 1.188c.78.78 1.221 1.842 1.221 2.95 0 2.307-1.873 4.183-4.183 4.183h-.06c-1.106 0-2.168-.44-2.948-1.221L8.51 12.876c-.065.21-.1.433-.1.664 0 1.414 1.147 2.562 2.563 2.562.23 0 .453-.035.664-.1l1.188 1.188c.78.78 1.221 1.842 1.221 2.95 0 2.307-1.873 4.183-4.183 4.183h-.06c-1.106 0-2.168-.44-2.948-1.221l-5.613-5.613c-.78-.78-1.221-1.842-1.221-2.95 0-2.307 1.873-4.183 4.183-4.183h.06c1.106 0 2.168.44 2.948 1.221l5.613 5.613z' }, // Simplified generic icon
  //       ].map((stat, i) => (
  //         <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between group hover:shadow-md transition">
  //           <div>
  //             <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
  //             <h3 className={`text-2xl font-bold text-${stat.color}-600`}>{formatNumber(stat.value)} <span className='text-xs text-gray-400'>IQD</span></h3>
  //           </div>
  //           <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
  //             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
  //           </div>
  //         </div>
  //       ))}
  //     </div>

  //     {/* Filters Toolbar */}
  //     <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
  //       <form onSubmit={applyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          
  //         <div className='col-span-1'>
  //            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Status</label>
  //            <select className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={status} onChange={(e) => setStatus(e.target.value)}>
  //             {statuses.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>)}
  //           </select>
  //         </div>

  //         <div className='col-span-1'>
  //            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Source</label>
  //            <select className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={source} onChange={(e) => setSource(e.target.value)}>
  //             {sources.map((s) => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Sources'}</option>)}
  //           </select>
  //         </div>

  //         <div className='col-span-1'>
  //            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">From Date</label>
  //            <input type="date" className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={from} onChange={(e) => setFrom(e.target.value)} />
  //         </div>

  //         <div className='col-span-1'>
  //            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">To Date</label>
  //            <input type="date" className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={to} onChange={(e) => setTo(e.target.value)} />
  //         </div>

  //         <div className='col-span-1'>
  //            <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Rows</label>
  //            <select className="w-full rounded-xl border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition" value={per} onChange={(e) => setPer(Number(e.target.value))}>
  //             {[50,100,200].map((n) => <option key={n} value={n}>{n} rows</option>)}
  //           </select>
  //         </div>

  //         <div className='col-span-1'>
  //            <button type='button' onClick={() => {setPage(1); fetchList();}} className='w-full rounded-xl bg-slate-100 text-slate-600 font-semibold px-3 py-2.5 text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2'>
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  //               Refresh Data
  //            </button>
  //         </div>
  //       </form>
  //     </div>

  //     {/* Main Table */}
  //     <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
  //       <div className="overflow-x-auto">
  //         {loading ? (
  //           <div className="p-12 text-center text-gray-400 flex flex-col items-center">
  //              <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
  //              <span className="text-sm font-medium">Loading sales records...</span>
  //           </div>
  //         ) : error ? (
  //           <div className="p-12 text-center text-red-500 bg-red-50">
  //             <p className="font-medium">Error loading data</p>
  //             <p className="text-sm mt-1">{error}</p>
  //           </div>
  //         ) : (
  //           <table className="w-full text-left border-collapse">
  //             <thead>
  //               <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
  //                 <th className="px-6 py-4 whitespace-nowrap">Order Info</th>
  //                 <th className="px-6 py-4 whitespace-nowrap">Status</th>
  //                 <th className="px-6 py-4 whitespace-nowrap">Customer</th>
  //                 <th className="px-6 py-4 whitespace-nowrap">Product</th>
  //                 <th className="px-6 py-4 whitespace-nowrap text-right">Qty</th>
  //                 <th className="px-6 py-4 whitespace-nowrap text-right">Sale Price</th>
  //                 <th className="px-6 py-4 whitespace-nowrap text-right">Profit</th>
  //               </tr>
  //             </thead>
  //             <tbody className="divide-y divide-gray-50">
  //               {items.length === 0 ? (
  //                  <tr>
  //                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
  //                       No sales records found matching your filters.
  //                    </td>
  //                  </tr>
  //               ) : (
  //                 items.map((r, idx) => (
  //                   <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
  //                     <td className="px-6 py-4 whitespace-nowrap">
  //                       <div className="flex flex-col">
  //                         <span className="font-bold text-gray-800">#{r.order_id}</span>
  //                         <span className="text-xs text-gray-400">{r.order_date?.slice(0, 10)}</span>
  //                         <span className="text-xs text-indigo-500 font-medium mt-0.5 capitalize">{r.order_source}</span>
  //                       </div>
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap">
  //                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-transparent ${getStatusColor(r.order_status)}`}>
  //                         {r.order_status}
  //                       </span>
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap">
  //                       <div className="flex flex-col">
  //                          <span className="text-sm font-medium text-gray-700">{r.customer_name || 'N/A'}</span>
  //                          <span className="text-xs text-gray-400">{r.phone_number}</span>
  //                       </div>
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap">
  //                       <div className="flex flex-col max-w-[200px]">
  //                          <span className="text-sm text-gray-700 truncate" title={r.product_name}>{r.product_name}</span>
  //                          <span className="text-xs text-gray-400">Code: {r.product_code}</span>
  //                       </div>
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 font-medium">
  //                       {r.quantity}
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
  //                       {formatNumber(r.sale_price)}
  //                     </td>
  //                     <td className="px-6 py-4 whitespace-nowrap text-right">
  //                       <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
  //                         +{formatNumber(r.total_profit)}
  //                       </span>
  //                     </td>
  //                   </tr>
  //                 ))
  //               )}
  //             </tbody>
  //           </table>
  //         )}
  //       </div>
        
  //       {/* Pagination Footer */}
  //       <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
  //         <div className="text-sm text-gray-500 font-medium">
  //            Page <span className="text-gray-900">{page}</span>
  //         </div>
  //         <div className="flex gap-2">
  //           <button 
  //             className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
  //             disabled={page <= 1} 
  //             onClick={() => setPage((p) => Math.max(1, p-1))}
  //           >
  //             Previous
  //           </button>
  //           <button 
  //             className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 transition shadow-sm" 
  //             onClick={() => setPage((p) => p+1)}
  //           >
  //             Next
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

