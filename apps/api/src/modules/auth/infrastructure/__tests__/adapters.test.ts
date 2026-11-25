import { describe, expect, it } from 'vitest'
import { SignJWT } from 'jose'
import { InvalidTokenError } from '../../application/errors.js'
import { Argon2PasswordHasher } from '../argon2-password-hasher.js'
import { JoseTokenService } from '../jose-token-service.js'
import { UuidIdGenerator } from '../uuid-id-generator.js'

const SECRET = 'un-secret-de-test-long-de-plus-de-32-caracteres'
const OPTIONS = { secret: SECRET, issuer: 'kendrick-api', audience: 'kendrick-web' }

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher()

  it('ne stocke pas le mot de passe en clair', async () => {
    const hashed = await hasher.hash('motdepasse123')
    expect(hashed).not.toContain('motdepasse123')
  })

  it('vérifie un bon mot de passe et refuse un mauvais', async () => {
    const hashed = await hasher.hash('motdepasse123')
    expect(await hasher.verify('motdepasse123', hashed)).toBe(true)
    expect(await hasher.verify('autre-mot-de-passe', hashed)).toBe(false)
  })

  it('produit un hash différent à chaque appel (sel aléatoire)', async () => {
    const first = await hasher.hash('motdepasse123')
    const second = await hasher.hash('motdepasse123')
    expect(first).not.toBe(second)
  })

  it('renvoie false si le hash est corrompu', async () => {
    expect(await hasher.verify('motdepasse123', 'pas-un-hash')).toBe(false)
  })
})

describe('JoseTokenService', () => {
  const tokens = new JoseTokenService(OPTIONS)

  it('signe puis relit un token', async () => {
    const token = await tokens.sign({ sub: 'user-1', role: 'ADMIN' })
    expect(await tokens.verify(token)).toEqual({ sub: 'user-1', role: 'ADMIN' })
  })

  it('refuse un token modifié', async () => {
    const token = await tokens.sign({ sub: 'user-1', role: 'CUSTOMER' })
    await expect(tokens.verify(`${token}x`)).rejects.toThrow(InvalidTokenError)
  })

  it('refuse un token signé avec un autre secret', async () => {
    const other = new JoseTokenService({
      ...OPTIONS,
      secret: 'un-autre-secret-aussi-long-que-le-premier-ok',
    })
    const token = await other.sign({ sub: 'user-1', role: 'CUSTOMER' })
    await expect(tokens.verify(token)).rejects.toThrow(InvalidTokenError)
  })

  it('refuse un token expiré', async () => {
    const expired = new JoseTokenService({ ...OPTIONS, expiresIn: '-1s' })
    const token = await expired.sign({ sub: 'user-1', role: 'CUSTOMER' })
    await expect(tokens.verify(token)).rejects.toThrow(InvalidTokenError)
  })

  it('refuse un token avec un rôle inconnu', async () => {
    const token = await new SignJWT({ role: 'SUPERADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setIssuer(OPTIONS.issuer)
      .setAudience(OPTIONS.audience)
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(SECRET))
    await expect(tokens.verify(token)).rejects.toThrow(InvalidTokenError)
  })

  it('refuse un token destiné à une autre audience', async () => {
    const other = new JoseTokenService({ ...OPTIONS, audience: 'autre-client' })
    const token = await other.sign({ sub: 'user-1', role: 'CUSTOMER' })
    await expect(tokens.verify(token)).rejects.toThrow(InvalidTokenError)
  })

  it('refuse un token émis par un autre émetteur', async () => {
    const other = new JoseTokenService({ ...OPTIONS, issuer: 'autre-api' })
    const token = await other.sign({ sub: 'user-1', role: 'CUSTOMER' })
    await expect(tokens.verify(token)).rejects.toThrow(InvalidTokenError)
  })

  it('refuse un secret trop court', () => {
    expect(() => new JoseTokenService({ ...OPTIONS, secret: 'court' })).toThrow(
      'au moins 32 caractères',
    )
  })
})

describe('UuidIdGenerator', () => {
  it('génère des identifiants uniques', () => {
    const ids = new UuidIdGenerator()
    expect(ids.generate()).not.toBe(ids.generate())
  })
})
