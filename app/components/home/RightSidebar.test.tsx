import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RightSidebar, { type Group } from './RightSidebar'

vi.mock('@/lib/useOnlineStatus', () => ({
  useOnlineStatus: () => ({
    onlineUsers: new Set(['1']),
    unreadFrom: new Set(['2']),
    clearUnread: vi.fn(),
  }),
}))

vi.mock('@/lib/useSidebarUsers', () => ({
  useSidebarUsers: () => [
    { id: '1', name: 'Alice', initials: 'A', online: true  },
    { id: '2', name: 'Bob',   initials: 'B', online: false },
  ],
}))

const groups: Group[] = [
  { id: '1', name: 'Dev Frontend', membersCount: '12' },
  { id: '2', name: 'Design UI',    membersCount: '5'  },
]

describe('RightSidebar', () => {
  it('affiche tous les noms de groupes', () => {
    render(<RightSidebar groups={groups} />)
    expect(screen.getByText('Dev Frontend')).toBeInTheDocument()
    expect(screen.getByText('Design UI')).toBeInTheDocument()
  })

  it('affiche le nombre de membres de chaque groupe', () => {
    render(<RightSidebar groups={groups} />)
    expect(screen.getByText('12 membres')).toBeInTheDocument()
    expect(screen.getByText('5 membres')).toBeInTheDocument()
  })

  it("affiche tous les noms d'utilisateurs", () => {
    render(<RightSidebar groups={[]} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('affiche un indicateur vert pour les utilisateurs en ligne', () => {
    const { container } = render(<RightSidebar groups={[]} />)
    expect(container.querySelectorAll('.bg-green-500')).toHaveLength(1)
  })

  it('affiche un indicateur orange pour les messages non lus', () => {
    const { container } = render(<RightSidebar groups={[]} />)
    expect(container.querySelectorAll('.bg-orange-400')).toHaveLength(1)
  })

  it('fonctionne avec une liste de groupes vide', () => {
    render(<RightSidebar groups={[]} />)
    expect(screen.getByText('Mes Groupes')).toBeInTheDocument()
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument()
  })
})
