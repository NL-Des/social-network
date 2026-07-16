import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './button'

describe('Button', () => {
  it('affiche le texte enfant', () => {
    render(<Button>Se connecter</Button>)
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument()
  })

  it('est de type submit', () => {
    render(<Button>Envoyer</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('applique une className personnalisée', () => {
    render(<Button className="ma-classe">OK</Button>)
    expect(screen.getByRole('button')).toHaveClass('ma-classe')
  })

  it('fonctionne sans className', () => {
    render(<Button>OK</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
