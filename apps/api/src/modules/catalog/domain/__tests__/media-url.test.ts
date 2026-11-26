import { describe, expect, it } from 'vitest'
import { InvalidMediaUrlError } from '../errors.js'
import { MediaUrl } from '../media-url.js'

describe('MediaUrl', () => {
  it.each(['https://cdn.example.com/cover.jpg', 'http://127.0.0.1:9000/preview.mp3'])(
    'accepte %s',
    (url) => {
      expect(MediaUrl.create(url).value).toBe(url)
    },
  )

  it('retire les espaces autour', () => {
    expect(MediaUrl.create('  https://cdn.example.com/a.jpg ').value).toBe(
      'https://cdn.example.com/a.jpg',
    )
  })

  it.each([
    '',
    '   ',
    'cover.jpg',
    '/images/cover.jpg',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ftp://example.com/a.mp3',
    `https://example.com/${'a'.repeat(2048)}`,
  ])('refuse « %s »', (url) => {
    expect(() => MediaUrl.create(url)).toThrow(InvalidMediaUrlError)
  })
})
