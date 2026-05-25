import { ButtonHTMLAttributes } from 'react'

// On définit proprement les types : on hérite de toutes les propriétés natives d'un bouton HTML (comme disabled)
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

export default function Button({ children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled} // Applique le vrai état HTML disabled
      {...props}          // Transmet les autres propriétés si nécessaires
      className={`bg-brand-card text-brand-text font-bold p-3 w-2/3 border-1 border-brand-border rounded-2xl transition-all duration-200 
        ${disabled 
          ? 'opacity-50 cursor-not-allowed shadow-none' // Si loading : pas de néon, curseur bloqué, un peu transparent
          : 'shadow-neon hover:text-white hover:scale-102 active:scale-95 cursor-pointer' // Ton design interactif d'origine
        } 
        ${className ?? ''}`}
    >
      {children}
    </button>
  )
}
