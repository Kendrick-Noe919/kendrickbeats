import { describe, expect, it } from 'vitest'
import {
  DuplicateLicenseError,
  InvalidBpmError,
  InvalidGenreError,
  InvalidMediaUrlError,
  InvalidMusicalKeyError,
  InvalidTagsError,
  InvalidTitleError,
  LicensePriceOrderError,
  NoLicenseOfferedError,
} from '../../domain/errors.js'
import type { CreateBeatInput } from '../create-beat.js'
import { createCatalog, validBeatInput } from './fakes.js'

describe('CreateBeat', () => {
  it('crée un brouillon et renvoie ses informations', async () => {
    const { createBeat, beats } = createCatalog()

    const beat = await createBeat.execute(validBeatInput())

    expect(beat).toMatchObject({
      id: 'beat-1',
      title: 'Neon Shadows',
      bpm: 140,
      durationSeconds: 185,
      tags: ['dark', 'melodic'],
      status: 'DRAFT',
      publishedAt: null,
      createdAt: '2026-11-26T10:00:00.000Z',
    })
    expect(beats.count()).toBe(1)
  })

  it('normalise le genre, la tonalité et les tags', async () => {
    const { createBeat } = createCatalog()

    const beat = await createBeat.execute(
      validBeatInput({ genre: 'rnb', key: 'bb minor', tags: ['#Dark', 'DARK', ' Chill '] }),
    )

    expect(beat.genre).toBe('RnB')
    expect(beat.key).toBe('A#m')
    expect(beat.tags).toEqual(['dark', 'chill'])
  })

  it('renvoie les licences triées, avec leur prix et leurs conditions', async () => {
    const { createBeat } = createCatalog()

    const beat = await createBeat.execute(
      validBeatInput({
        licenses: [
          { type: 'EXCLUSIVE', price: 150000 },
          { type: 'BASIC', price: 10000 },
        ],
      }),
    )

    expect(beat.licenses.map((offer) => offer.type)).toEqual(['BASIC', 'EXCLUSIVE'])
    expect(beat.licenses[0]).toMatchObject({
      name: 'Basic',
      price: 10000,
      currency: 'XAF',
      files: ['MP3'],
      maxStreams: 100000,
      musicVideo: false,
      exclusive: false,
    })
    expect(beat.licenses[1]).toMatchObject({ exclusive: true, maxStreams: null })
  })

  it('donne un identifiant différent à chaque beat', async () => {
    const { createBeat } = createCatalog()

    const first = await createBeat.execute(validBeatInput())
    const second = await createBeat.execute(validBeatInput({ title: 'Autre' }))

    expect(first.id).not.toBe(second.id)
  })

  const invalidCases: {
    label: string
    override: Partial<CreateBeatInput>
    error: new () => Error
  }[] = [
    { label: 'un BPM hors limites', override: { bpm: 500 }, error: InvalidBpmError },
    { label: 'un genre inconnu', override: { genre: 'techno' }, error: InvalidGenreError },
    { label: 'une tonalité invalide', override: { key: 'H' }, error: InvalidMusicalKeyError },
    { label: 'un tag invalide', override: { tags: ['<script>'] }, error: InvalidTagsError },
    { label: 'un titre vide', override: { title: '  ' }, error: InvalidTitleError },
    {
      label: 'une cover qui n’est pas une URL',
      override: { coverUrl: 'cover.jpg' },
      error: InvalidMediaUrlError,
    },
    { label: 'aucune licence', override: { licenses: [] }, error: NoLicenseOfferedError },
    {
      label: 'une formule en double',
      override: {
        licenses: [
          { type: 'BASIC', price: 1000 },
          { type: 'BASIC', price: 2000 },
        ],
      },
      error: DuplicateLicenseError,
    },
    {
      label: 'un Premium moins cher que le Basic',
      override: {
        licenses: [
          { type: 'BASIC', price: 20000 },
          { type: 'PREMIUM', price: 10000 },
        ],
      },
      error: LicensePriceOrderError,
    },
  ]

  it.each(invalidCases)('refuse $label et n’enregistre rien', async ({ override, error }) => {
    const { createBeat, beats } = createCatalog()

    await expect(createBeat.execute(validBeatInput(override))).rejects.toThrow(error)
    expect(beats.count()).toBe(0)
  })
})
