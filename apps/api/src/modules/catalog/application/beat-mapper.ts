import type { BeatDto, LicenseOfferDto } from '@kendrick/contracts'
import type { Beat } from '../domain/beat.js'
import type { LicenseOffer } from '../domain/license-offers.js'
import { LICENSE_TERMS } from '../domain/license-terms.js'

function toLicenseOfferDto(offer: LicenseOffer): LicenseOfferDto {
  const terms = LICENSE_TERMS[offer.type]
  return {
    type: offer.type,
    name: terms.name,
    price: offer.price.amount,
    currency: offer.price.currency,
    files: [...terms.files],
    maxStreams: terms.maxStreams,
    maxCopies: terms.maxCopies,
    musicVideo: terms.musicVideo,
    paidLivePerformance: terms.paidLivePerformance,
    exclusive: terms.exclusive,
  }
}

export function toBeatDto(beat: Beat): BeatDto {
  return {
    id: beat.id,
    title: beat.title,
    genre: beat.genre.value,
    bpm: beat.bpm.value,
    key: beat.musicalKey.value,
    durationSeconds: beat.duration.seconds,
    tags: [...beat.tags.values],
    coverUrl: beat.coverUrl.value,
    previewUrl: beat.previewUrl.value,
    status: beat.status,
    createdAt: beat.createdAt.toISOString(),
    publishedAt: beat.publishedAt?.toISOString() ?? null,
    licenses: beat.licenses.items.map(toLicenseOfferDto),
  }
}
