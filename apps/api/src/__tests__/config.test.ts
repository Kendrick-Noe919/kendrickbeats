import { describe, expect, it } from 'vitest'
import { loadConfig } from '../config.js'

const SECRET = 'un-secret-de-test-long-de-plus-de-32-caracteres'
const DATABASE_URL = 'postgresql://user:pass@localhost:5432/kendrick_beats'
const validEnv = { JWT_SECRET: SECRET, DATABASE_URL }

describe('loadConfig', () => {
  it('applique les valeurs par défaut', () => {
    const config = loadConfig(validEnv)

    expect(config.PORT).toBe(3000)
    expect(config.JWT_ISSUER).toBe('kendrick-beats-api')
    expect(config.JWT_EXPIRES_IN).toBe('15m')
  })

  it('convertit PORT en nombre', () => {
    expect(loadConfig({ ...validEnv, PORT: '4000' }).PORT).toBe(4000)
  })

  it('refuse un secret manquant', () => {
    expect(() => loadConfig({})).toThrow('JWT_SECRET')
  })

  it('refuse une URL de base de données manquante', () => {
    expect(() => loadConfig({ JWT_SECRET: SECRET })).toThrow('DATABASE_URL')
  })

  it('refuse un secret trop court', () => {
    expect(() => loadConfig({ ...validEnv, JWT_SECRET: 'court' })).toThrow('Configuration invalide')
  })
  it('autorise par défaut le site web local (CORS)', () => {
    expect(loadConfig(validEnv).CORS_ORIGINS).toEqual([
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ])
  })

  it('découpe CORS_ORIGINS en liste et ignore les espaces', () => {
    const config = loadConfig({
      ...validEnv,
      CORS_ORIGINS: 'https://a.example.com, https://b.example.com ',
    })

    expect(config.CORS_ORIGINS).toEqual(['https://a.example.com', 'https://b.example.com'])
  })
})
