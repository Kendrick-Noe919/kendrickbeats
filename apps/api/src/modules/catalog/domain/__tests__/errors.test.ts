import { describe, expect, it } from 'vitest'
import { Bpm } from '../bpm.js'
import { CatalogValidationError, InvalidBpmError } from '../errors.js'

describe('Erreurs du catalogue', () => {
  it('héritent toutes de CatalogValidationError', () => {
    expect(() => Bpm.create(5)).toThrow(CatalogValidationError)
  })

  it('portent le nom de leur classe', () => {
    expect(new InvalidBpmError().name).toBe('InvalidBpmError')
  })
})
