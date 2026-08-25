import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function IconClose() {
 return (
 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <line x1="18" y1="6" x2="6" y2="18" />
 <line x1="6" y1="6" x2="18" y2="18" />
 </svg>
 );
}

const WIDTH_CLASSES = {
 md: 'max-w-xl',
 lg: 'max-w-2xl',
 xl: 'max-w-4xl',
 full: 'max-w-6xl',
};

export default function AdminDrawer({
 open,
 onClose,
 title,
 subtitle,
 eyebrow,
 headerBadge,
 size = 'lg',
 footer = null,
 children,
}) {
 useEffect(() => {
 if (!open) return undefined;
 const previousOverflow = document.body.style.overflow;
 document.body.style.overflow = 'hidden';
 const handleKeyDown = (event) => {
 if (event.key === 'Escape') onClose?.();
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => {
 document.body.style.overflow = previousOverflow;
 window.removeEventListener('keydown', handleKeyDown);
 };
 }, [open, onClose]);

 if (!open) return null;

 return createPortal(
 <div className="fixed inset-0 z-50 overflow-hidden">
 <div className="absolute inset-0 bg-[#000000]/70 backdrop-blur-md" onClick={onClose} />

 <div className="absolute inset-y-0 right-0 flex w-full justify-end p-0" onClick={onClose}>
 <section
 className={`relative flex h-full w-full ${WIDTH_CLASSES[size] || WIDTH_CLASSES.lg} flex-col overflow-hidden rounded-none border-l border-[#1F2A5A]/15 bg-[#f9fafb] text-[#1F2A5A]`}
 onClick={(event) => event.stopPropagation()}
 >
 <div className="relative flex items-start justify-between gap-4 border-b border-[#1F2A5A]/15 px-5 py-5 sm:px-7">
 <div className="space-y-2">
 {eyebrow ? (
 <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1F2A5A]/50">
 {eyebrow}
 </div>
 ) : null}
 <div className="flex flex-wrap items-center gap-2">
 <h2 className="text-xl font-semibold tracking-tight text-[#1F2A5A]">{title}</h2>
 {headerBadge}
 </div>
 {subtitle ? <p className="max-w-2xl text-sm text-[#1F2A5A]/60">{subtitle}</p> : null}
 </div>

 <button
 type="button"
 onClick={onClose}
 className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#1F2A5A]/15 bg-[#ffffff] text-[#1F2A5A]/60 transition-colors hover:bg-[#1F2A5A] hover:text-[#1F2A5A]"
 aria-label="Close drawer"
 >
 <IconClose />
 </button>
 </div>

 <div className="relative flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
 {children}
 </div>

 {footer ? (
 <div className="relative border-t border-[#1F2A5A]/15 bg-[#f9fafb] px-5 py-4 sm:px-7">
 {footer}
 </div>
 ) : null}
 </section>
 </div>
 </div>,
 document.body
 );
}
