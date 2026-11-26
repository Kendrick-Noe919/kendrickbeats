import { describe, expect, it } from 'vitest'
import { loadConfig } from '../config.js'

const SECRET = 'a30d356505e8949ec73ca1d6db1f07c95a81fb9e74df4e68a50bb81c146c8be3  '

describe('loadConfig', () => {
  it('applique les valeurs par défaut', () => {
    const config = loadConfig({ JWT_SECRET: SECRET })

    expect(config.PORT).toBe(3000)
    expect(config.JWT_ISSUER).toBe('kendrick-beats-api')
    expect(config.JWT_EXPIRES_IN).toBe('15m')
  })

  it('convertit PORT en nombre', () => {
    expect(loadConfig({ JWT_SECRET: SECRET, PORT: '4000' }).PORT).toBe(4000)
  })

  it('refuse un secret manquant', () => {
    expect(() => loadConfig({})).toThrow('JWT_SECRET')
  })

  it('refuse un secret trop court', () => {
    expect(() => loadConfig({ JWT_SECRET: 'court' })).toThrow('Configuration invalide')
  })
})
