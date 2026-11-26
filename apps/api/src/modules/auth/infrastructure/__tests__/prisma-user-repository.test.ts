import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createPrismaClient } from '../../../../shared/infrastructure/prisma-client.js'
import { EmailAlreadyUsedError } from '../../application/errors.js'
import { Email } from '../../domain/email.js'
import { User } from '../../domain/user.js'
import { PrismaUserRepository } from '../prisma-user-repository.js'

const testUrl = process.env['DATABASE_URL_TEST']

describe.skipIf(!testUrl)('PrismaUserRepository (base de test)', () => {
  const prisma = createPrismaClient(testUrl ?? '')
  const repository = new PrismaUserRepository(prisma)

  const makeUser = (overrides: { id?: string; email?: string } = {}) =>
    User.create({
      id: overrides.id ?? 'user-1',
      email: Email.create(overrides.email ?? 'kendrick@mail.com'),
      displayName: 'Kendrick',
      passwordHash: 'hash-factice',
    })

  beforeAll(() => {
    // Garde-fous : on vide la table avant chaque test, donc jamais sur la vraie base.
    if (testUrl === process.env['DATABASE_URL']) {
      throw new Error('DATABASE_URL_TEST doit être différente de DATABASE_URL')
    }
    if (!new URL(testUrl ?? '').pathname.endsWith('_test')) {
      throw new Error('Le nom de la base de test doit se terminer par "_test"')
    }
  })

  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('enregistre un utilisateur puis le retrouve par email', async () => {
    const user = makeUser()
    await repository.save(user)

    const found = await repository.findByEmail(Email.create('kendrick@mail.com'))

    expect(found?.id).toBe('user-1')
    expect(found?.email.value).toBe('kendrick@mail.com')
    expect(found?.displayName).toBe('Kendrick')
    expect(found?.passwordHash).toBe('hash-factice')
    expect(found?.role).toBe('CUSTOMER')
    expect(found?.createdAt.getTime()).toBe(user.createdAt.getTime())
  })

  it('retrouve un utilisateur par identifiant', async () => {
    await repository.save(makeUser())

    expect((await repository.findById('user-1'))?.email.value).toBe('kendrick@mail.com')
  })

  it('renvoie null pour un email ou un identifiant inconnu', async () => {
    expect(await repository.findByEmail(Email.create('inconnu@mail.com'))).toBeNull()
    expect(await repository.findById('user-99')).toBeNull()
  })

  it('traduit la violation de contrainte unique en EmailAlreadyUsedError', async () => {
    await repository.save(makeUser({ id: 'user-1' }))

    await expect(repository.save(makeUser({ id: 'user-2' }))).rejects.toThrow(EmailAlreadyUsedError)
  })

  it('refuse deux inscriptions simultanées avec le même email', async () => {
    const results = await Promise.allSettled([
      repository.save(makeUser({ id: 'user-1' })),
      repository.save(makeUser({ id: 'user-2' })),
    ])

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1)
  })
})
