import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().startsWith('postgres'),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default('kendrick-beats-api'),
  JWT_AUDIENCE: z.string().min(1).default('kendrick-beats-web'),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
})

export type AppConfig = z.infer<typeof envSchema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(env)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.map(String).join('.')} (${issue.message})`)
      .join(', ')
    throw new Error(`Configuration invalide : ${details}`)
  }

  return result.data
}
