import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../store/toast';

// ─── Icons ───────────────────────────────────────────────────────
function IconGift() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>);
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
function IconFilter() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>);
}
function IconSearch() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>);
}
function IconZap() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
}
function IconCalendar() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
}
function IconCheck() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>);
}
function IconPercent() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>);
}
function IconDollar() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
}
function IconStar() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>);
}
function IconPackage() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
}
function IconSave() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>);
}
function IconArrowLeft() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
}
function IconArrowRight() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
}
function IconSettings() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
}
function IconRefresh() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>);
}
function IconChevronDown() {
  return (<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
}

export default function PromotionsPage() {
  const { add } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: null, name: '', coupon_code: '', description: '', discount_type: 'percentage',
    discount_value: '', usage_limit: '', min_order_amount: 0, display_limit: '',
    extra_pool_limit: '', start_date: '', end_date: '', is_active: 1, priority: 0,
  });

  const [manageId, setManageId] = useState(null);
  const [manageData, setManageData] = useState(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [overrideEdits, setOverrideEdits] = useState({});
  const [addOverridePrice, setAddOverridePrice] = useState({});

  const [specSearch, setSpecSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSpecs, setProductSpecs] = useState([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilter !== '') params.set('active', activeFilter);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const res = await api.get(`/api/promotions?${params.toString()}`);
      setItems(res.data || res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeFilter, dateFrom, dateTo]);

  useEffect(() => { fetchList(); }, [fetchList]);

  function openCreate() {
    setModalMode('create');
    setFormData({
      id: null, name: '', description: '', discount_type: 'percentage',
      discount_value: '', coupon_code: '', usage_limit: '', min_order_amount: 0,
      display_limit: '', extra_pool_limit: '', start_date: '', end_date: '', is_active: 1, priority: 0,
    });
    setModalOpen(true);
  }

  function openEdit(p) {
    setModalMode('edit');
    setFormData({
      id: p.id, name: p.name, coupon_code: p.coupon_code || '', description: p.description || '',
      discount_type: p.discount_type, discount_value: p.discount_value,
      usage_limit: p.usage_limit ?? '', min_order_amount: p.min_order_amount ?? 0,
      display_limit: p.display_limit ?? '', extra_pool_limit: p.extra_pool_limit ?? '',
      start_date: p.start_date, end_date: p.end_date, is_active: p.is_active, priority: p.priority || 0,
    });
    setModalOpen(true);
  }

  async function submitForm(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        coupon_code: formData.discount_type === 'campaign' ? null : ((formData.coupon_code || '').trim() || null),
        description: formData.description || undefined,
        discount_type: formData.discount_type === 'amount' ? 'fixed' : formData.discount_type,
        discount_value: formData.discount_type === 'campaign' ? 0 : Number(formData.discount_value),
        usage_limit: formData.usage_limit === '' ? null : Number(formData.usage_limit),
        min_order_amount: Number(formData.min_order_amount || 0),
        display_limit: formData.discount_type === 'campaign' ? (formData.display_limit === '' ? null : Number(formData.display_limit)) : null,
        extra_pool_limit: formData.discount_type === 'campaign' ? (formData.extra_pool_limit === '' ? null : Number(formData.extra_pool_limit)) : null,
        start_date: formData.start_date, end_date: formData.end_date,
        is_active: Number(formData.is_active), priority: Number(formData.priority),
      };
      if (modalMode === 'create') {
        await api.post('/api/promotions', payload);
        add('Promotion created', 'success');
      } else {
        await api.patch(`/api/promotions?id=${formData.id}`, payload);
        add('Promotion updated', 'success');
      }
      setModalOpen(false);
      fetchList();
    } catch (e) { add(e.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function toggleActive(p) {
    try {
      await api.patch(`/api/promotions?id=${p.id}`, { is_active: p.is_active ? 0 : 1 });
      fetchList();
      add(p.is_active ? 'Deactivated' : 'Activated', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function deletePromotion(id) {
    try {
      await api.del(`/api/promotions?id=${id}`);
      fetchList();
      add('Promotion deleted', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function openManage(id) {
    setManageId(id);
    setManageLoading(true);
    setSpecSearch(''); setSearchResults([]); setSelectedProduct(null);
    try {
      const res = await api.get(`/api/promotions?id=${id}`);
      setManageData(res);
      const list = res?.items || [];
      const next = {};
      for (const it of list) { const sid = it.product_spec_id || it.id; if (sid != null) next[sid] = it.override_price ?? ''; }
      setOverrideEdits(next);
      setAddOverridePrice({});
    } catch (e) { add(e.message, 'error'); }
    finally { setManageLoading(false); }
  }

  async function refreshManage() {
    if (!manageId) return;
    const res = await api.get(`/api/promotions?id=${manageId}`);
    setManageData(res);
    const list = res?.items || [];
    const next = {};
    for (const it of list) { const sid = it.product_spec_id || it.id; if (sid != null) next[sid] = it.override_price ?? ''; }
    setOverrideEdits(next);
  }

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!specSearch.trim()) { setSearchResults([]); return; }
      setSearchLoading(true);
      try {
        const res = await api.get(`/api/products?search=${specSearch}&per_page=5`);
        setSearchResults(res.data || res || []);
      } catch { setSearchResults([]); }
      finally { setSearchLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [specSearch]);

  async function selectProductForSpecs(prod) {
    setSelectedProduct(prod);
    try {
      const res = await api.get(`/api/products/${prod.id}/specs`);
      setProductSpecs(res.data || res || []);
    } catch { setProductSpecs([]); }
  }

  async function addItem(specId) {
    try {
      const promo = manageData?.promotion;
      const isCampaign = promo?.discount_type === 'campaign';
      const dl = isCampaign && promo?.display_limit != null ? Number(promo.display_limit) : 0;
      const ep = isCampaign && promo?.extra_pool_limit != null ? Number(promo.extra_pool_limit) : 0;
      const hl = isCampaign && dl > 0 ? dl + Math.max(0, ep) : null;
      if (isCampaign && hl != null && (manageData?.items?.length || 0) >= hl) { add('Campaign limit reached', 'error'); return; }
      const override = addOverridePrice?.[specId];
      if (isCampaign && (override == null || override === '')) { add('Override price required', 'error'); return; }
      await api.post(`/api/promotions/${manageId}/items`, {
        product_spec_id: Number(specId),
        override_price: isCampaign && override !== '' && override != null ? Number(override) : null,
      });
      refreshManage();
      add('Item added', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function updateOverridePrice(specId) {
    try {
      await api.patch(`/api/promotions/${manageId}/items?spec_id=${specId}`, {
        override_price: overrideEdits?.[specId] === '' ? null : Number(overrideEdits?.[specId]),
      });
      refreshManage();
      add('Saved', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  async function removeItem(specId) {
    try {
      await api.del(`/api/promotions/${manageId}/items?spec_id=${specId}`);
      refreshManage();
      add('Item removed', 'success');
    } catch (e) { add(e.message, 'error'); }
  }

  const managePromotion = manageData?.promotion;
  const isCampaignManage = managePromotion?.discount_type === 'campaign';
  const displayLimitManage = isCampaignManage && managePromotion?.display_limit != null ? Number(managePromotion.display_limit) : 0;
  const extraPoolManage = isCampaignManage && managePromotion?.extra_pool_limit != null ? Number(managePromotion.extra_pool_limit) : 0;
  const hardLimitManage = isCampaignManage && displayLimitManage > 0 ? displayLimitManage + Math.max(0, extraPoolManage) : null;
  const orderedManageItems = (manageData?.items || []).slice().sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
  const displayItemsManage = isCampaignManage && displayLimitManage > 0 ? orderedManageItems.slice(0, displayLimitManage) : orderedManageItems;
  const extraItemsManage = isCampaignManage && displayLimitManage > 0 ? orderedManageItems.slice(displayLimitManage, hardLimitManage ?? undefined) : [];
  const totalCampaignPrice = isCampaignManage && displayLimitManage > 0
    ? displayItemsManage.reduce((sum, it) => sum + (Number(it.override_price) || 0), 0) : 0;
  const canAddMoreCampaign = hardLimitManage == null ? true : orderedManageItems.length < hardLimitManage;

  const activeCount = items.filter((p) => p.is_active).length;

  function getDiscountBadge(p) {
    if (p.discount_type === 'campaign') return { label: 'Campaign', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <IconStar /> };
    if (p.discount_type === 'percentage') return { label: `${p.discount_value}%`, bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: <IconPercent /> };
    return { label: `${Number(p.discount_value).toLocaleString()} IQD`, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <IconDollar /> };
  }

  function isExpired(p) {
    return p.end_date && new Date(p.end_date) < new Date();
  }

  // ─── Item Card Component ──────────────────────────────────────
  function ItemCard({ it, showOverride }) {
    return (
      <div className="group rounded-xl border border-slate-200/60 bg-white p-4 hover:shadow-md hover:shadow-primary/10 hover:border-primary/20 transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-slate-800">{it.product_name}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {it.color_name && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/50 font-medium">
                  {it.color_name}
                </span>
              )}
              {it.size_name && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50 font-medium">
                  {it.size_name}
                </span>
              )}
              <span className="text-[10px] text-muted">
                Price: <strong>{it.price?.toLocaleString()}</strong>
              </span>
            </div>
            {showOverride && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  className="w-32 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-mono bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={overrideEdits?.[it.product_spec_id] ?? ''}
                  onChange={(e) => setOverrideEdits((s) => ({ ...s, [it.product_spec_id]: e.target.value }))}
                  placeholder="Override"
                />
                <button
                  onClick={() => updateOverridePrice(it.product_spec_id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white text-xs font-semibold shadow-sm shadow-accent/10 hover:shadow-lg hover:shadow-accent/20 transition-all duration-200 hover:scale-105"
                >
                  <IconSave /> Save
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => removeItem(it.product_spec_id || it.id)}
            className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 hover:scale-110 shrink-0"
            title="Remove"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-secondary/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/30">
                <IconGift />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-bold text-white">{items.length}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Promotions
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-accent font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {activeCount} active
                </span>
                <span className="flex items-center gap-1 text-xs text-muted font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                  {items.length - activeCount} inactive
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
            <span>New Promotion</span>
          </button>
        </div>

        {/* ─── Filter Bar ─────────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <IconFilter />
              </div>

              {/* Status */}
              <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1">
                {[
                  { value: '', label: 'All' },
                  { value: '1', label: 'Active' },
                  { value: '0', label: 'Inactive' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setActiveFilter(opt.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      activeFilter === opt.value
                        ? 'bg-white text-primary shadow-md shadow-primary/10 ring-1 ring-primary/10'
                        : 'text-muted hover:text-slate-700 hover:bg-white/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-muted">
                  <IconCalendar />
                  <span className="text-[10px] font-bold uppercase tracking-wider">From</span>
                </div>
                <input
                  type="date"
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-slate-50/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span className="text-xs text-muted">to</span>
                <input
                  type="date"
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs bg-slate-50/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            {(activeFilter || dateFrom || dateTo) && (
              <button
                onClick={() => { setActiveFilter(''); setDateFrom(''); setDateTo(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-muted hover:bg-slate-50 transition-all"
              >
                <IconRefresh /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ─── Promotions List ────────────────────────────────── */}
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <p className="text-sm text-muted animate-pulse font-medium">Loading promotions...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary/30">
                <IconGift />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-600 text-lg">No promotions found</p>
                <p className="text-sm text-muted mt-1">Create your first promotion to boost sales</p>
              </div>
              <button onClick={openCreate} className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <IconPlus /> Create Promotion
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary/5 to-secondary/5">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-12">#</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Promotion</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coupon</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Discount</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest w-20">Priority</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest w-28">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-widest w-44">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {items.map((p, idx) => {
                    const badge = getDiscountBadge(p);
                    const expired = isExpired(p);
                    return (
                      <tr
                        key={p.id}
                        className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200 cursor-pointer"
                        onClick={() => openManage(p.id)}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <td className="px-6 py-4 text-sm font-bold text-muted">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">{p.name}</div>
                          {p.description && <div className="text-[10px] text-muted mt-0.5 line-clamp-1">{p.description}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {p.coupon_code ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-mono font-bold text-slate-700 border border-slate-200/60">
                              {p.coupon_code}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                             {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <IconCalendar />
                            <span>{p.start_date}</span>
                            <span className="text-slate-300">→</span>
                            <span className={expired ? 'text-red-500 line-through' : ''}>{p.end_date}</span>
                          </div>
                          {expired && <span className="text-[9px] text-red-500 font-bold">EXPIRED</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 mx-auto">
                            {p.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            p.is_active
                             ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                          }`}>
                            {p.is_active ? (
                              <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white"><IconCheck /></span>
                            ) : (
                              <span className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center text-white"><IconX /></span>
                            )}
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openManage(p.id)}
                              className="p-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white shadow-sm shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 hover:scale-110"
                              title="Manage Items"
                            >
                              <IconSettings />
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="p-2 rounded-xl bg-secondary/5 text-secondary hover:bg-secondary hover:text-white shadow-sm shadow-secondary/10 hover:shadow-lg hover:shadow-secondary/20 transition-all duration-200 hover:scale-110"
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => toggleActive(p)}
                              className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                                p.is_active
                                  ? 'bg-accent/10 text-accent hover:bg-accent hover:text-white shadow-sm shadow-accent/10 hover:shadow-lg hover:shadow-accent/20'
                                  : 'bg-slate-100 text-muted hover:bg-slate-500 hover:text-white shadow-sm hover:shadow-lg'
                              }`}
                              title="Toggle Active"
                            >
                              <IconZap />
                            </button>
                            <button
                              onClick={() => deletePromotion(p.id)}
                              className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200 hover:scale-110"
                              title="Delete"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── CREATE / EDIT MODAL ────────────────────────────── */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-lg"
            style={{ marginTop: '0px' }}
            onClick={(e) => e.target === e.currentTarget && !submitting && setModalOpen(false)}
          >
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ring-1 ring-slate-200/50">
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
                        {modalMode === 'create' ? 'New Promotion' : 'Edit Promotion'}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        {modalMode === 'create' ? 'Create a new promotional offer' : `Editing: ${formData.name}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-muted hover:text-slate-600 hover:rotate-90 transition-all duration-300">
                    <IconX />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-7 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Promotion Name <span className="text-red-400">*</span>
                  </label>
                  <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300" placeholder="e.g. Summer Sale 2025" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Coupon */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Coupon Code</label>
                    <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono placeholder:text-slate-300" placeholder="NEW10" value={formData.coupon_code} onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })} />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Discount Type</label>
                    <div className="relative">
                      <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer" value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="campaign">Campaign (override)</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"><IconChevronDown /></div>
                    </div>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Value</label>
                    <input type="number" step="0.01" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:bg-slate-100" value={formData.discount_type === 'campaign' ? 0 : formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} required={formData.discount_type !== 'campaign'} disabled={formData.discount_type === 'campaign'} />
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Usage Limit</label>
                    <input type="number" min="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300" placeholder="Unlimited" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} />
                  </div>

                  {/* Campaign Fields */}
                  {formData.discount_type === 'campaign' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Display Limit</label>
                        <input type="number" min="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300" placeholder="e.g. 10" value={formData.display_limit} onChange={(e) => setFormData({ ...formData, display_limit: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Extra Pool</label>
                        <input type="number" min="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300" placeholder="e.g. 5" value={formData.extra_pool_limit} onChange={(e) => setFormData({ ...formData, extra_pool_limit: e.target.value })} />
                      </div>
                    </>
                  )}

                  {/* Min Order */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Order Amount</label>
                    <input type="number" min="0" step="0.01" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.min_order_amount} onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })} />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
                    <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date <span className="text-red-400">*</span></label>
                    <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date <span className="text-red-400">*</span></label>
                    <input type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300" placeholder="Optional description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                {/* Active Toggle */}
                <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <label className="relative inline-flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" checked={!!formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })} />
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-accent peer-checked:to-emerald-500 transition-colors duration-300" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700">{formData.is_active ? 'Active' : 'Inactive'}</span>
                      <p className="text-[10px] text-muted">Available to customers when active</p>
                    </div>
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                  <button type="button" onClick={() => setModalOpen(false)} disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-slate-100 transition-all disabled:opacity-50">Cancel</button>
                  <button disabled={submitting} type="submit" className="relative px-7 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="relative">
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : modalMode === 'create' ? 'Create Promotion' : 'Save Changes'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── MANAGE ITEMS MODAL ─────────────────────────────── */}
        {manageId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-lg"
            style={{ marginTop: '0px' }}
            onClick={(e) => e.target === e.currentTarget && setManageId(null)}
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden ring-1 ring-slate-200/50">
              {/* Header */}
              <div className="relative px-7 py-5 border-b border-slate-100 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] bg-gradient-to-br from-primary to-secondary" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
                      <IconPackage />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">Manage Items</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted">{managePromotion?.name}</span>
                        {isCampaignManage && displayLimitManage > 0 && (
                          <>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                              Display: {Math.min(displayItemsManage.length, displayLimitManage)}/{displayLimitManage}
                            </span>
                            {extraPoolManage > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                                Extra: {extraItemsManage.length}/{extraPoolManage}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                              Total: {Number(totalCampaignPrice).toLocaleString()} IQD
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setManageId(null)} className="p-2 rounded-xl hover:bg-slate-100 text-muted hover:text-slate-600 hover:rotate-90 transition-all duration-300">
                    <IconX />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* LEFT: Current Items */}
                <div className="flex-1 overflow-y-auto p-5 border-r border-slate-100">
                  {manageLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <div className="w-10 h-10 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                      <p className="text-sm text-muted">Loading items...</p>
                    </div>
                  ) : isCampaignManage && displayLimitManage > 0 ? (
                    <div className="space-y-6">
                      {/* Display Items */}
                      <div>
                        <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white z-10 pb-2">
                          <div className="p-1 rounded-lg bg-primary/10 text-primary"><IconGift /></div>
                          <span className="text-sm font-bold text-slate-700">Display Items</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{displayItemsManage.length}/{displayLimitManage}</span>
                        </div>
                        {displayItemsManage.length === 0 ? (
                          <div className="text-center py-10 text-muted bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <IconGift />
                            <p className="text-sm mt-2">No display items yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {displayItemsManage.map((it) => <ItemCard key={it.id || it.product_spec_id} it={it} showOverride />)}
                          </div>
                        )}
                      </div>

                      {/* Extra Pool */}
                      {extraPoolManage > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white z-10 pb-2">
                            <div className="p-1 rounded-lg bg-amber-100 text-amber-600"><IconStar /></div>
                            <span className="text-sm font-bold text-slate-700">Extra Pool</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">{extraItemsManage.length}/{extraPoolManage}</span>
                          </div>
                          {extraItemsManage.length === 0 ? (
                            <div className="text-center py-8 text-muted bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                              <p className="text-sm">No extra pool items</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {extraItemsManage.map((it) => <ItemCard key={it.id || it.product_spec_id} it={it} showOverride />)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white z-10 pb-2">
                        <div className="p-1 rounded-lg bg-primary/10 text-primary"><IconPackage /></div>
                        <span className="text-sm font-bold text-slate-700">Included Items</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{manageData?.items?.length || 0}</span>
                      </div>
                      {(manageData?.items || []).length === 0 ? (
                        <div className="text-center py-16 text-muted bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300"><IconPackage /></div>
                          <p className="text-sm font-medium">No items yet</p>
                          <p className="text-xs mt-1">Search and add products from the right panel</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {manageData.items.map((it) => <ItemCard key={it.id || it.product_spec_id} it={it} showOverride={false} />)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT: Add Items */}
                <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-slate-50/80 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-secondary/10 text-secondary"><IconPlus /></div>
                      <span className="text-sm font-bold text-slate-700">Add Items</span>
                    </div>
                    {isCampaignManage && hardLimitManage != null && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold">
                        {orderedManageItems.length}/{hardLimitManage}
                      </span>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                      <IconSearch />
                    </div>
                    <input
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-300"
                      placeholder="Search products..."
                      value={specSearch}
                      onChange={(e) => setSpecSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    {searchLoading && (
                      <div className="text-center py-4">
                        <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
                      </div>
                    )}

                    {/* Product List */}
                    {!selectedProduct && searchResults.map((pr) => (
                      <div
                        key={pr.id}
                        className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/60 cursor-pointer hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 transition-all duration-200 group"
                        onClick={() => selectProductForSpecs(pr)}
                      >
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">{pr.name}</span>
                        <div className="flex items-center gap-1 text-xs text-primary font-medium">
                          View Specs <IconArrowRight />
                        </div>
                      </div>
                    ))}

                    {/* Specs List */}
                    {selectedProduct && (
                      <div className="space-y-3">
                        <button
                          onClick={() => { setSelectedProduct(null); setProductSpecs([]); }}
                          className="flex items-center gap-1.5 text-xs text-muted hover:text-primary font-medium transition-colors"
                        >
                          <IconArrowLeft /> Back to search
                        </button>
                        <div className="font-bold text-sm text-slate-800 px-1">{selectedProduct.name}</div>

                        {productSpecs.length === 0 ? (
                          <div className="text-center py-8 text-muted bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-xs">No specs found</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {productSpecs.map((sp) => {
                              const isAdded = manageData?.items?.some((i) => (i.product_spec_id || i.id) === sp.id);
                              return (
                                <div key={sp.id} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/60 hover:shadow-sm transition-all">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {sp.color_name && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200/50 font-medium">{sp.color_name}</span>
                                      )}
                                      {sp.size_name && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50 font-medium">{sp.size_name}</span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-muted mt-1">
                                      Stock: <strong>{sp.stock}</strong> • Price: <strong>{Number(sp.price).toLocaleString()}</strong>
                                    </div>
                                  </div>
                                  {isAdded ? (
                                    <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-accent/10 text-accent font-bold">
                                      <IconCheck /> Added
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      {isCampaignManage && (
                                        <input
                                          type="number"
                                          step="0.01"
                                          className="w-24 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-mono bg-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                          value={addOverridePrice?.[sp.id] ?? ''}
                                          onChange={(e) => setAddOverridePrice((s) => ({ ...s, [sp.id]: e.target.value }))}
                                          placeholder="Price"
                                        />
                                      )}
                                      <button
                                        onClick={() => addItem(sp.id)}
                                        disabled={isCampaignManage && !canAddMoreCampaign}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        <IconPlus /> Add
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-slate-100 bg-gradient-to-r from-primary/5 to-secondary/5 flex justify-end">
                <button
                  onClick={() => setManageId(null)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}