import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export default function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`bg-brand-card text-brand-text font-bold p-3 w-2/3 border-1 border-brand-border shadow-neon rounded-2xl hover:text-white transition-transform duration-200 hover:scale-102 active:scale-95 ${className ?? ''}`}
      {...props}
    >
      {children}
    </button>
  )
}
