import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header, { type CurrentUser } from './Header'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

const user: CurrentUser = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  followers: 42,
  initials: 'JD',
}

describe('Header', () => {
  it("affiche le nom de l'utilisateur", () => {
    render(<Header user={user} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it("affiche le username avec @", () => {
    render(<Header user={user} />)
    expect(screen.getByText(/@johndoe/)).toBeInTheDocument()
  })

  it("affiche le nombre d'abonnés", () => {
    render(<Header user={user} />)
    expect(screen.getByText(/42 abonnés/)).toBeInTheDocument()
  })

  it("affiche les initiales de l'utilisateur", () => {
    render(<Header user={user} />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('affiche tous les liens de navigation', () => {
    render(<Header user={user} />)
    expect(screen.getByText('Accueil')).toBeInTheDocument()
    expect(screen.getByText('Groupes')).toBeInTheDocument()
    expect(screen.getByText('Messages')).toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })

  it('le lien actif a le style mis en avant', () => {
    render(<Header user={user} />)
    const accueilLink = screen.getByText('Accueil').closest('a')
    expect(accueilLink?.className).toContain('border')
  })
})
