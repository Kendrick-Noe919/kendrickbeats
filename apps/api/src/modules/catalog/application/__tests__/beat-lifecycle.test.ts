import { describe, expect, it } from 'vitest'
import { InvalidBeatTransitionError } from '../../domain/errors.js'
import { BeatNotFoundError } from '../errors.js'
import { createCatalog, validBeatInput } from './fakes.js'

describe('PublishBeat', () => {
  it('publie un brouillon avec la date de l’horloge', async () => {
    const { createBeat, publishBeat, clock } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())
    clock.advance(60_000)

    const published = await publishBeat.execute(draft.id)

    expect(published.status).toBe('PUBLISHED')
    expect(published.publishedAt).toBe('2026-11-26T10:01:00.000Z')
  })

  it('enregistre vraiment le nouvel état', async () => {
    const { createBeat, publishBeat, beats } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())

    await publishBeat.execute(draft.id)

    expect((await beats.findById(draft.id))?.status).toBe('PUBLISHED')
  })

  it('refuse un beat inconnu', async () => {
    const { publishBeat } = createCatalog()

    await expect(publishBeat.execute('beat-99')).rejects.toThrow(BeatNotFoundError)
  })

  it('refuse de publier deux fois', async () => {
    const { createBeat, publishBeat } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())
    await publishBeat.execute(draft.id)

    await expect(publishBeat.execute(draft.id)).rejects.toThrow(InvalidBeatTransitionError)
  })
})

describe('ArchiveBeat', () => {
  it('archive un beat publié', async () => {
    const { createBeat, publishBeat, archiveBeat } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())
    await publishBeat.execute(draft.id)

    const archived = await archiveBeat.execute(draft.id)

    expect(archived.status).toBe('ARCHIVED')
  })

  it('refuse d’archiver un brouillon', async () => {
    const { createBeat, archiveBeat } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())

    await expect(archiveBeat.execute(draft.id)).rejects.toThrow(InvalidBeatTransitionError)
  })

  it('refuse un beat inconnu', async () => {
    const { archiveBeat } = createCatalog()

    await expect(archiveBeat.execute('beat-99')).rejects.toThrow(BeatNotFoundError)
  })
})

describe('GetPublishedBeat', () => {
  it('renvoie un beat publié', async () => {
    const { createBeat, publishBeat, getPublishedBeat } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())
    await publishBeat.execute(draft.id)

    const beat = await getPublishedBeat.execute(draft.id)

    expect(beat.title).toBe('Neon Shadows')
    expect(beat.licenses).toHaveLength(3)
  })

  it('cache un brouillon : il est introuvable pour le public', async () => {
    const { createBeat, getPublishedBeat } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())

    await expect(getPublishedBeat.execute(draft.id)).rejects.toThrow(BeatNotFoundError)
  })

  it('cache un beat archivé', async () => {
    const { createBeat, publishBeat, archiveBeat, getPublishedBeat } = createCatalog()
    const draft = await createBeat.execute(validBeatInput())
    await publishBeat.execute(draft.id)
    await archiveBeat.execute(draft.id)

    await expect(getPublishedBeat.execute(draft.id)).rejects.toThrow(BeatNotFoundError)
  })

  it('renvoie la même erreur pour un beat qui n’existe pas', async () => {
    const { getPublishedBeat } = createCatalog()

    await expect(getPublishedBeat.execute('beat-99')).rejects.toThrow(BeatNotFoundError)
  })
})
