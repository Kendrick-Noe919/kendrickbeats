import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  EmailAlreadyUsedError,
  InvalidCredentialsError,
  InvalidPasswordError,
  InvalidTokenError,
} from '../../application/errors.js'
import { InvalidDisplayNameError, InvalidEmailError } from '../../domain/errors.js'

interface HttpErrorRule {
  type: new () => Error
  status: number
  code: string
}

const HTTP_ERROR_RULES: HttpErrorRule[] = [
  { type: InvalidEmailError, status: 400, code: 'INVALID_EMAIL' },
  { type: InvalidDisplayNameError, status: 400, code: 'INVALID_DISPLAY_NAME' },
  { type: InvalidPasswordError, status: 400, code: 'INVALID_PASSWORD' },
  { type: InvalidCredentialsError, status: 401, code: 'INVALID_CREDENTIALS' },
  { type: InvalidTokenError, status: 401, code: 'INVALID_TOKEN' },
  { type: EmailAlreadyUsedError, status: 409, code: 'EMAIL_ALREADY_USED' },
]

function getClientErrorStatus(error: unknown): number | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    error.statusCode >= 400 &&
    error.statusCode < 500
  ) {
    return error.statusCode
  }
  return null
}

export function errorHandler(error: unknown, request: FastifyRequest, reply: FastifyReply) {
  const rule = HTTP_ERROR_RULES.find((r) => error instanceof r.type)
  if (rule && error instanceof Error) {
    return reply.status(rule.status).send({ error: { code: rule.code, message: error.message } })
  }

  const clientStatus = getClientErrorStatus(error)
  if (clientStatus !== null) {
    return reply
      .status(clientStatus)
      .send({ error: { code: 'BAD_REQUEST', message: 'Requête invalide' } })
  }

  request.log.error(error)
  return reply
    .status(500)
    .send({ error: { code: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' } })
}
