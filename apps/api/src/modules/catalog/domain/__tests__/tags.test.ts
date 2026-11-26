import { describe, expect, it } from 'vitest'
import { InvalidTagsError } from '../errors.js'
import { Tags } from '../tags.js'

describe('Tags', () => {
  it('normalise : minuscules, « # » retiré, espaces simplifiés', () => {
    const tags = Tags.create(['#Dark', '  Melodic   Loop ', 'Travis-Scott'])

    expect(tags.values).toEqual(['dark', 'melodic loop', 'travis-scott'])
  })

  it('supprime les doublons en gardant l’ordre', () => {
    expect(Tags.create(['dark', '#DARK', 'trap', 'Dark']).values).toEqual(['dark', 'trap'])
  })

  it('accepte une liste vide et les lettres accentuées', () => {
    expect(Tags.create([]).values).toEqual([])
    expect(Tags.create(['Mélancolique']).values).toEqual(['mélancolique'])
  })

  it('accepte 10 tags, refuse 11', () => {
    const ten = Array.from({ length: 10 }, (_, i) => `tag${i}`)

    expect(Tags.create(ten).values).toHaveLength(10)
    expect(() => Tags.create([...ten, 'tag10'])).toThrow(InvalidTagsError)
  })

  it.each([[''], ['a'], ['#'], ['a'.repeat(31)], ['pas de point.'], ['<script>'], ['-tiret']])(
    'refuse le tag %j',
    (tag) => {
      expect(() => Tags.create([tag])).toThrow(InvalidTagsError)
    },
  )

  it('retrouve un tag quelle que soit sa casse', () => {
    const tags = Tags.create(['dark'])

    expect(tags.has('#Dark')).toBe(true)
    expect(tags.has('trap')).toBe(false)
  })
})
