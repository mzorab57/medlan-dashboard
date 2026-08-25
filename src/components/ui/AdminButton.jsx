function joinClasses(...parts) {
 return parts.filter(Boolean).join(' ');
}

const VARIANT_CLASSES = {
 primary: 'border border-[#4BB7D8]/30 bg-[#4BB7D8]/10 text-[#4BB7D8] hover:bg-[#4BB7D8]/20 hover:border-[#4BB7D8]/40',
 secondary: 'border border-[#1F2A5A]/20 bg-[#1F2A5A]/5 text-[#1F2A5A] hover:bg-[#1F2A5A]/10',
 ghost: 'border border-transparent bg-transparent text-[#1F2A5A]/80 hover:bg-[#1F2A5A]/5 hover:text-[#1F2A5A]',
 subtle: 'border border-transparent bg-[#1F2A5A]/5 text-[#1F2A5A]/80 hover:bg-[#1F2A5A]/10 hover:text-[#1F2A5A]',
 danger: 'border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:border-red-500/40',
 success: 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:border-emerald-500/40',
};

const SIZE_CLASSES = {
 sm: 'h-9 px-3 text-xs',
 md: 'h-10 px-4 text-sm',
 lg: 'h-11 px-5 text-sm',
};

export default function AdminButton({
 as: Comp = 'button',
 type = 'button',
 variant = 'secondary',
 size = 'md',
 block = false,
 className = '',
 leftIcon = null,
 rightIcon = null,
 children,
 ...props
}) {
 return (
 <Comp
 type={Comp === 'button' ? type : undefined}
 className={joinClasses(
 'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200',
 'disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px',
 'focus:outline-none focus:ring-2 focus:ring-p-300/30',
 VARIANT_CLASSES[variant] || VARIANT_CLASSES.secondary,
 SIZE_CLASSES[size] || SIZE_CLASSES.md,
 block ? 'w-full' : '',
 className,
 )}
 {...props}
 >
 {leftIcon}
 <span>{children}</span>
 {rightIcon}
 </Comp>
 );
}
