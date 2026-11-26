import 'dotenv/config'
import { execSync } from 'node:child_process'

/**
 * Applique les migrations Prisma sur la base de test avant de lancer les tests.
 * Sans DATABASE_URL_TEST, les tests d'intégration sont ignorés (describe.skipIf),
 * donc il n'y a rien à préparer.
 */
export default function setup(): void {
  const testUrl = process.env['DATABASE_URL_TEST']
  if (!testUrl) return

  if (testUrl === process.env['DATABASE_URL']) {
    throw new Error('DATABASE_URL_TEST doit être différente de DATABASE_URL')
  }
  if (!new URL(testUrl).pathname.endsWith('_test')) {
    throw new Error('Le nom de la base de test doit se terminer par "_test"')
  }

  // prisma.config.ts lit DATABASE_URL ; dotenv n'écrase pas une variable déjà définie,
  // donc la base de test est bien celle utilisée ici.
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: testUrl },
  })
}
