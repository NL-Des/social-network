export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="min-h-screen ">
      {/* Le contenu de page.tsx s'affichera ici */}
      {children}
    </div>
  )
}
