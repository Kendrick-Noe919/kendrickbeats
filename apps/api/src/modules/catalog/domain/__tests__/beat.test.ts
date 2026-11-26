import { describe, expect, it } from 'vitest'
import { Beat, type CreateBeatProps } from '../beat.js'
import { Bpm } from '../bpm.js'
import { Duration } from '../duration.js'
import { InvalidBeatTransitionError, InvalidTitleError } from '../errors.js'
import { Genre } from '../genre.js'
import { LicenseOffers } from '../license-offers.js'
import { MediaUrl } from '../media-url.js'
import { Money } from '../money.js'
import { MusicalKey } from '../musical-key.js'
import { Tags } from '../tags.js'

const withExclusive = LicenseOffers.create([
  { type: 'BASIC', price: Money.create(10000) },
  { type: 'EXCLUSIVE', price: Money.create(150000) },
])
const withoutExclusive = LicenseOffers.create([{ type: 'BASIC', price: Money.create(10000) }])

function makeProps(overrides: Partial<CreateBeatProps> = {}): CreateBeatProps {
  return {
    id: 'beat-1',
    title: 'Neon Shadows',
    genre: Genre.create('trap'),
    bpm: Bpm.create(140),
    musicalKey: MusicalKey.create('Dm'),
    duration: Duration.create(185),
    tags: Tags.create(['dark', 'melodic']),
    coverUrl: MediaUrl.create('https://cdn.example.com/neon-shadows.jpg'),
    previewUrl: MediaUrl.create('https://cdn.example.com/neon-shadows-preview.mp3'),
    licenses: withExclusive,
    ...overrides,
  }
}

const NOW = new Date('2026-11-26T10:00:00Z')
const LATER = new Date('2026-12-01T10:00:00Z')

describe('Beat.create', () => {
  it('crée un brouillon avec toutes ses informations', () => {
    const beat = Beat.create(makeProps(), NOW)

    expect(beat.id).toBe('beat-1')
    expect(beat.title).toBe('Neon Shadows')
    expect(beat.genre.value).toBe('Trap')
    expect(beat.bpm.value).toBe(140)
    expect(beat.musicalKey.value).toBe('Dm')
    expect(beat.duration.seconds).toBe(185)
    expect(beat.tags.values).toEqual(['dark', 'melodic'])
    expect(beat.licenses.items).toHaveLength(2)
    expect(beat.status).toBe('DRAFT')
    expect(beat.createdAt).toEqual(NOW)
    expect(beat.publishedAt).toBeNull()
    expect(beat.isPublished).toBe(false)
  })

  it('retire les espaces autour du titre', () => {
    expect(Beat.create(makeProps({ title: '  Cloud 9  ' })).title).toBe('Cloud 9')
  })

  it.each(['', '   ', 'a'.repeat(101)])('refuse le titre « %s »', (title) => {
    expect(() => Beat.create(makeProps({ title }))).toThrow(InvalidTitleError)
  })
})

describe('Cycle de vie', () => {
  it('publie un brouillon et mémorise la date', () => {
    const published = Beat.create(makeProps(), NOW).publish(LATER)

    expect(published.status).toBe('PUBLISHED')
    expect(published.isPublished).toBe(true)
    expect(published.publishedAt).toEqual(LATER)
  })

  it('ne modifie pas le beat d’origine (objet immuable)', () => {
    const draft = Beat.create(makeProps(), NOW)

    draft.publish(LATER)

    expect(draft.status).toBe('DRAFT')
    expect(draft.publishedAt).toBeNull()
  })

  it('refuse de publier deux fois', () => {
    const published = Beat.create(makeProps(), NOW).publish(LATER)

    expect(() => published.publish()).toThrow(InvalidBeatTransitionError)
  })

  it('archive un beat publié', () => {
    const archived = Beat.create(makeProps(), NOW).publish(LATER).archive()

    expect(archived.status).toBe('ARCHIVED')
    expect(archived.isPublished).toBe(false)
  })

  it('refuse d’archiver un brouillon', () => {
    expect(() => Beat.create(makeProps(), NOW).archive()).toThrow(InvalidBeatTransitionError)
  })

  it('republie une archive en gardant la date de première publication', () => {
    const republished = Beat.create(makeProps(), NOW)
      .publish(LATER)
      .archive()
      .publish(new Date('2027-01-01T00:00:00Z'))

    expect(republished.status).toBe('PUBLISHED')
    expect(republished.publishedAt).toEqual(LATER)
  })

  it('enregistre la vente en exclusivité d’un beat publié', () => {
    const sold = Beat.create(makeProps(), NOW).publish(LATER).markSoldExclusively()

    expect(sold.status).toBe('SOLD')
    expect(sold.isPublished).toBe(false)
  })

  it('refuse la vente exclusive si la formule Exclusive n’est pas proposée', () => {
    const beat = Beat.create(makeProps({ licenses: withoutExclusive }), NOW).publish(LATER)

    expect(() => beat.markSoldExclusively()).toThrow(InvalidBeatTransitionError)
  })

  it('refuse la vente exclusive d’un brouillon', () => {
    expect(() => Beat.create(makeProps(), NOW).markSoldExclusively()).toThrow(
      InvalidBeatTransitionError,
    )
  })

  it('un beat vendu en exclusivité ne peut plus changer d’état', () => {
    const sold = Beat.create(makeProps(), NOW).publish(LATER).markSoldExclusively()

    expect(() => sold.publish()).toThrow(InvalidBeatTransitionError)
    expect(() => sold.archive()).toThrow(InvalidBeatTransitionError)
    expect(() => sold.markSoldExclusively()).toThrow(InvalidBeatTransitionError)
  })

  it('le message d’erreur dit l’action et le statut', () => {
    expect(() => Beat.create(makeProps(), NOW).archive()).toThrow(
      'Impossible d’archiver un beat au statut DRAFT',
    )
    expect(() => Beat.create(makeProps(), NOW).publish(LATER).publish()).toThrow(
      'Impossible de publier un beat au statut PUBLISHED',
    )
  })
})

describe('Beat.restore', () => {
  it('reconstruit un beat enregistré sans rejouer les règles de création', () => {
    const beat = Beat.restore({
      ...makeProps(),
      status: 'ARCHIVED',
      createdAt: NOW,
      publishedAt: LATER,
    })

    expect(beat.status).toBe('ARCHIVED')
    expect(beat.publishedAt).toEqual(LATER)
  })
})
