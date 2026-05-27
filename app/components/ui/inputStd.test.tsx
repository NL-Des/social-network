import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InputStd from './inputStd'

describe('InputStd', () => {
  it('affiche le placeholder', () => {
    render(<InputStd type="text" placeholder="Votre email" name="email" />)
    expect(screen.getByPlaceholderText('Votre email')).toBeInTheDocument()
  })

  it('applique le type correct', () => {
    render(<InputStd type="password" placeholder="Mot de passe" name="password" />)
    expect(screen.getByPlaceholderText('Mot de passe')).toHaveAttribute('type', 'password')
  })

  it('applique le name correct', () => {
    render(<InputStd type="email" placeholder="Email" name="email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('name', 'email')
  })

  it('applique une className personnalisée', () => {
    render(<InputStd type="text" placeholder="Test" name="test" className="custom" />)
    expect(screen.getByPlaceholderText('Test')).toHaveClass('custom')
  })
})
