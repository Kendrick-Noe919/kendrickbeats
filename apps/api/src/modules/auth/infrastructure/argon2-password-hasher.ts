import { hash, verify } from '@node-rs/argon2'
import type { PasswordHasher } from '../application/ports/password-hasher.js'

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plain: string): Promise<string> {
    return hash(plain)
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    try {
      return await verify(hashed, plain)
    } catch {
      return false
    }
  }
}
