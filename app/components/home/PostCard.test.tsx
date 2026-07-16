import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PostCard, { type Post } from './PostCard'

const mockPost: Post = {
  id: '1',
  author: { name: 'Alice Dupont', initials: 'AD' },
  content: 'Bonjour tout le monde !',
}

describe('PostCard', () => {
  it("affiche le nom de l'auteur", () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Alice Dupont')).toBeInTheDocument()
  })

  it("affiche les initiales de l'auteur", () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('AD')).toBeInTheDocument()
  })

  it('affiche le contenu du post', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText('Bonjour tout le monde !')).toBeInTheDocument()
  })

  it('affiche un contenu multi-lignes', () => {
    const post: Post = { ...mockPost, content: 'Ligne 1\nLigne 2' }
    const { container } = render(<PostCard post={post} />)
    const p = container.querySelector('p')
    expect(p?.textContent).toBe('Ligne 1\nLigne 2')
  })
})
