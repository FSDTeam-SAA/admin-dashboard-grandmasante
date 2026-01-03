import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styling matching the "Grandma santé" clean look
        'flex w-full min-w-0 bg-white px-4 py-2 text-base transition-all outline-none',
        'border border-slate-200 rounded-xl shadow-sm',
        'placeholder:text-slate-400 font-medium text-slate-700',
        
        // File input styling
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        
        // Focus and Interaction (using the brand green #38B475)
        'focus-visible:border-[#38B475] focus-visible:ring-4 focus-visible:ring-[#38B475]/10',
        
        // Disabled & Error states
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        
        'md:text-sm h-11',
        className,
      )}
      {...props}
    />
  )
}

export { Input }