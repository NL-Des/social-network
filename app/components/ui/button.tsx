interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function ButtonWithoutBorders({ 
  children, 
  onClick, 
  className = "", 
  type = "button" 
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      // On utilise les backticks pour fusionner les classes de base et les classes personnalisées
      className={`bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 px-4 rounded-sm transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export default function Button({children, className}) {
  return (
    <button
      type="submit"
      className={`bg-brand-card text-brand-text font-bold p-3 w-2/3 border-1 border-brand-border shadow-neon rounded-2xl hover:text-white transition-transform duration-200 hover:scale-102 active:scale-95 ${className ?? ''}`}
    >
      {children}
    </button>
  )
}