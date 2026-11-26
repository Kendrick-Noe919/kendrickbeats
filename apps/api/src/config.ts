import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().startsWith('postgres'),
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().min(1).default('kendrick-beats-api'),
  JWT_AUDIENCE: z.string().min(1).default('kendrick-beats-web'),
  JWT_EXPIRES_IN: z.string().min(1).default('15m'),
  CORS_ORIGINS: z
    .string()
    .default('http://127.0.0.1:5173,http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin !== ''),
    ),
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
