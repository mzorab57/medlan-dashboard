import { useToast } from '../store/toast';

export default function Toaster() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`min-w-[240px] rounded-lg shadow-md px-3 py-2 text-sm text-white ${
            t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-900'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span>{t.message}</span>
            <button className="text-white/80 hover:text-white" onClick={() => remove(t.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
