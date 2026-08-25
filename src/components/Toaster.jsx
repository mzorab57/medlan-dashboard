import { useToast } from '../store/toast';

export default function Toaster() {
 const { toasts, remove } = useToast();
 return (
 <div className="fixed top-4 right-4 z-[1000] space-y-2">
 {toasts.map((t) => (
 <div
 key={t.id}
 className={`min-w-[240px] rounded-lg px-3 py-2 text-sm text-[#1F2A5A] ${
 t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-900'
 }`}
 >
 <div className="flex items-center justify-between gap-3">
 <span>{t.message}</span>
 <button className="text-[#1F2A5A]/80 hover:text-[#1F2A5A]" onClick={() => remove(t.id)}>✕</button>
 </div>
 </div>
 ))}
 </div>
 );
}
