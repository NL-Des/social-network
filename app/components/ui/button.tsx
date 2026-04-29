import Link from "next/link";
import { Children } from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  href: string;
  type?: "button" | "submit" | "reset";
}

export function ButtonToHome({ 
  children,
  className = ""
}: ButtonProps) {
  return (
    <Link
      href="http://localhost:3000/"
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className}`}
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
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className}`}
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
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className}`}
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
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className}`}
    >
      {children}
    </Link>
  );
}

export function ButtonToGoToOneGroupOnTheSideBar({ 
  children,
  href, // Récupération du lien de redirection vers le groupe sur la page qui affiche le bouton.
  className = ""
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className}`}
    >
      {children}
    </Link>
  );
}

export function ButtonToOneUserProfilOnTheSideBar({ 
  children,
  href,
  className = ""
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className}
      `}
    >
      {children}
    </Link>
  );
}

export function ButtonSearch({children, className}) {
  return(
    <button
      type="submit"
      className={`
        flex items-center justify-center text-center w-full

        bg-brand-card font-bold p-2 w 

        hover:scale-102 hover: text-white 
        hover:border-brand-border hover:shadow-neon hover:rounded-2xl

        active:scale-85 transition-transform duration-200
        ${className ?? ''}`}
    >
      {children}
    </button>
  )
}

export default function Button({children, className}) {
  return (
    <button
      type="submit"
      className={`
        bg-brand-card 
        font-bold p-3 w-2/3 
        border-1 border-brand-border shadow-neon rounded-2xl
         hover:text-white transition-transform duration-200 
        hover:scale-102 active:scale-85 
        ${className ?? ''}`}
    >
      {children}
    </button>
  )
}