import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function ButtonToHome({ 
  children,
  className = ""
}: ButtonProps) {
  return (
    <Link
      href="http://localhost:3000/"
      className={`inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 px-4 rounded-sm transition-colors ${className}`}
    >  
      {children}
    </Link>
  );
}

export function ButtonToGroups({ 
  children,
  className = ""
}: ButtonProps) {
  return (
    <Link
      href="/auth"
      className={`inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 px-4 rounded-sm transition-colors ${className}`}
    >  
      {children}
    </Link>
  );
}

export function ButtonToMessages({ 
  children,
  className = ""
}: ButtonProps) {
  return (
    <Link
      href="/auth"
      className={`inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 px-4 rounded-sm transition-colors ${className}`}
    >  
      {children}
    </Link>
  );
}

export function ButtonToNotifications({ 
  children,
  className = ""
}: ButtonProps) {
  return (
    <Link
      href="/auth"
      className={`inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold h-10 px-4 rounded-sm transition-colors ${className}`}
    >  
      {children}
    </Link>
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