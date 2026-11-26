import cors from '@fastify/cors'
import Fastify from 'fastify'
import {
  registerAuthRoutes,
  type AuthRoutesDependencies,
} from './modules/auth/presentation/http/auth-routes.js'
import { errorHandler } from './modules/auth/presentation/http/error-handler.js'

export interface AppOptions {
  /** Active les journaux de requêtes (désactivé dans les tests). */
  logger?: boolean
  /** Origines (sites web) autorisées à appeler l'API depuis un navigateur. */
  corsOrigins?: string[]
}

export function buildApp(deps: AuthRoutesDependencies, options: AppOptions = {}) {
  const { logger = false, corsOrigins = [] } = options
  const app = Fastify({ logger })

  // Sans origine autorisée, aucun en-tête CORS n'est envoyé : le navigateur bloque tout.
  void app.register(cors, { origin: corsOrigins })

  app.setErrorHandler(errorHandler)

  app.get('/health', () => ({ status: 'ok' }))
  registerAuthRoutes(app, deps)

  return app
}
