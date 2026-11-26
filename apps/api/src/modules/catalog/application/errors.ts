export class BeatNotFoundError extends Error {
  constructor() {
    super('Beat introuvable')
    this.name = 'BeatNotFoundError'
  }
}
