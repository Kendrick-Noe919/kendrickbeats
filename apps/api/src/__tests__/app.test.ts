import { describe, expect, it } from 'vitest'
import { createTestApp } from './test-app.js'

const ALLOWED = 'http://127.0.0.1:5173'

describe('Application HTTP', () => {
  it('GET /health répond 200 avec { status: "ok" }', async () => {
    const app = createTestApp()

    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })

  describe('CORS', () => {
    it('répond au préflight pour une origine autorisée', async () => {
      const app = createTestApp([ALLOWED])

      const response = await app.inject({
        method: 'OPTIONS',
        url: '/auth/register',
        headers: {
          origin: ALLOWED,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type',
        },
      })

      expect(response.statusCode).toBe(204)
      expect(response.headers['access-control-allow-origin']).toBe(ALLOWED)
    })

    it('autorise la réponse réelle pour une origine autorisée', async () => {
      const app = createTestApp([ALLOWED])

      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: { origin: ALLOWED },
      })

      expect(response.headers['access-control-allow-origin']).toBe(ALLOWED)
    })

    it("n'envoie aucun en-tête CORS pour une origine inconnue", async () => {
      const app = createTestApp([ALLOWED])

      const response = await app.inject({
        method: 'GET',
        url: '/health',
        headers: { origin: 'https://pirate.example.com' },
      })

      expect(response.headers['access-control-allow-origin']).toBeUndefined()
    })
  })
})
