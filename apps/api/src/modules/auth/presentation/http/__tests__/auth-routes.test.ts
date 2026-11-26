import { beforeEach, describe, expect, it } from 'vitest'
import { createTestApp } from '../../../../../__tests__/test-app.js'

type ErrorBody = { error: { code: string } }

const validUser = {
  email: 'kendrick@mail.com',
  displayName: 'Kendrick',
  password: 'motdepasse123',
}

describe('Routes HTTP /auth', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(() => {
    app = createTestApp()
  })

  it('POST /auth/register crée un utilisateur (201) sans mot de passe', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/register', payload: validUser })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      id: 'user-1',
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      role: 'CUSTOMER',
    })
  })

  it('POST /auth/register refuse un email invalide (400)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...validUser, email: 'pas-un-email' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_EMAIL')
  })

  it('POST /auth/register refuse un mot de passe trop court (400)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...validUser, password: '1234' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_PASSWORD')
  })

  it('POST /auth/register refuse un nom vide (400)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...validUser, displayName: '   ' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_DISPLAY_NAME')
  })

  it('POST /auth/register refuse un corps incomplet (400)', async () => {
    const response = await app.inject({ method: 'POST', url: '/auth/register', payload: {} })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorBody>().error.code).toBe('VALIDATION_ERROR')
  })

  it('POST /auth/register refuse un JSON mal formé (400)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      headers: { 'content-type': 'application/json' },
      payload: '{pas du json',
    })

    expect(response.statusCode).toBe(400)
    expect(response.json<ErrorBody>().error.code).toBe('BAD_REQUEST')
  })

  it('POST /auth/register refuse un email déjà utilisé (409)', async () => {
    await app.inject({ method: 'POST', url: '/auth/register', payload: validUser })
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { ...validUser, email: 'KENDRICK@mail.com' },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json<ErrorBody>().error.code).toBe('EMAIL_ALREADY_USED')
  })

  it('POST /auth/login connecte un utilisateur inscrit (200)', async () => {
    await app.inject({ method: 'POST', url: '/auth/register', payload: validUser })
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: validUser.email, password: validUser.password },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json<{ accessToken: string }>().accessToken).toBe('token:user-1:CUSTOMER')
  })

  it('POST /auth/login refuse un mauvais mot de passe (401)', async () => {
    await app.inject({ method: 'POST', url: '/auth/register', payload: validUser })
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: validUser.email, password: 'mauvaismdp' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_CREDENTIALS')
  })

  it('POST /auth/login répond pareil pour un email inconnu (401)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'inconnu@mail.com', password: 'motdepasse123' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_CREDENTIALS')
  })
})

describe('Route protégée GET /auth/me', () => {
  let app: ReturnType<typeof createTestApp>

  beforeEach(async () => {
    app = createTestApp()
    await app.inject({ method: 'POST', url: '/auth/register', payload: validUser })
  })

  async function loginToken(): Promise<string> {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: validUser.email, password: validUser.password },
    })
    return response.json<{ accessToken: string }>().accessToken
  }

  it('renvoie le profil de l’utilisateur connecté (200)', async () => {
    const token = await loginToken()

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      id: 'user-1',
      email: 'kendrick@mail.com',
      displayName: 'Kendrick',
      role: 'CUSTOMER',
    })
  })

  it('refuse une requête sans en-tête Authorization (401)', async () => {
    const response = await app.inject({ method: 'GET', url: '/auth/me' })

    expect(response.statusCode).toBe(401)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_TOKEN')
  })

  it('refuse un schéma autre que Bearer (401)', async () => {
    const token = await loginToken()

    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Basic ${token}` },
    })

    expect(response.statusCode).toBe(401)
  })

  it('refuse un token invalide (401)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: 'Bearer nimportequoi' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_TOKEN')
  })

  it('refuse un token valide dont le compte n’existe pas (401)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: 'Bearer token:user-99:CUSTOMER' },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json<ErrorBody>().error.code).toBe('INVALID_TOKEN')
  })
})
