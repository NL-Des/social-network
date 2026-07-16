import { describe, it, expect } from 'vitest'
import { getInitials } from './utils'

describe('getInitials', () => {
  it('retourne les initiales en majuscules', () => {
    expect(getInitials('John', 'Doe')).toBe('JD')
  })

  it('fonctionne avec des noms déjà en majuscules', () => {
    expect(getInitials('ALICE', 'SMITH')).toBe('AS')
  })

  it('retourne uniquement la première initiale si lastName est vide', () => {
    expect(getInitials('John', '')).toBe('J')
  })

  it('retourne uniquement la deuxième initiale si firstName est vide', () => {
    expect(getInitials('', 'Doe')).toBe('D')
  })

  it('retourne une chaîne vide si les deux sont vides', () => {
    expect(getInitials('', '')).toBe('')
  })

  it('gère les caractères unicode', () => {
    expect(getInitials('Élise', 'Ômar')).toBe('ÉÔ')
  })
})
