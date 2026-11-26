import { LICENSE_TYPES } from '@kendrick/contracts'
import { describe, expect, it } from 'vitest'
import { LICENSE_TERMS } from '../license-terms.js'

describe('LICENSE_TERMS', () => {
  it('définit les conditions de chaque formule', () => {
    for (const type of LICENSE_TYPES) {
      expect(LICENSE_TERMS[type].files.length).toBeGreaterThan(0)
    }
  })

  it('seule la formule Exclusive est exclusive', () => {
    const exclusive = LICENSE_TYPES.filter((type) => LICENSE_TERMS[type].exclusive)

    expect(exclusive).toEqual(['EXCLUSIVE'])
  })

  it('chaque formule livre au moins autant de fichiers que la précédente', () => {
    const counts = LICENSE_TYPES.map((type) => LICENSE_TERMS[type].files.length)

    expect(counts).toEqual([...counts].sort((a, b) => a - b))
  })

  it('la formule Basic ne livre que le MP3 et interdit le clip vidéo', () => {
    expect(LICENSE_TERMS.BASIC.files).toEqual(['MP3'])
    expect(LICENSE_TERMS.BASIC.musicVideo).toBe(false)
  })

  it('les formules Unlimited et Exclusive n’ont aucune limite de streams', () => {
    expect(LICENSE_TERMS.UNLIMITED.maxStreams).toBeNull()
    expect(LICENSE_TERMS.EXCLUSIVE.maxStreams).toBeNull()
  })
})
