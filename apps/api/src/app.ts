import Fastify from 'fastify'
import {
  registerAuthRoutes,
  type AuthRoutesDependencies,
} from './modules/auth/presentation/http/auth-routes.js'
import { errorHandler } from './modules/auth/presentation/http/error-handler.js'

export function buildApp(deps: AuthRoutesDependencies, logger = false) {
  const app = Fastify({ logger })

  app.setErrorHandler(errorHandler)

  app.get('/health', () => ({ status: 'ok' }))
  registerAuthRoutes(app, deps)

  return app
}
