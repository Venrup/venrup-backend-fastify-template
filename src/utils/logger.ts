// src/utils/logger.ts
import type { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify'
import log4js from 'log4js'

log4js.configure({
  appenders: {
    console: { type: 'console' }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: 'info'
    }
  }
})

const logger = log4js.getLogger()

// Fastify hooks for logging
export const loggerHooks = {
  // Log request details
  preHandler: (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    logger.info({
      request: {
        url: request.url,
        method: request.method,
        params: request.params,
        query: request.query,
        body: request.body
      }
    })
    done()
  },

  // Log response
  onSend: (
    request: FastifyRequest,
    reply: FastifyReply,
    payload: unknown,
    done: HookHandlerDoneFunction
  ) => {
    logger.info({
      response: {
        url: request.url,
        method: request.method,
        statusCode: reply.statusCode,
        body: payload
      }
    })
    done()
  },

  // Log errors
  onError: (
    request: FastifyRequest,
    reply: FastifyReply,
    error: Error,
    done: HookHandlerDoneFunction
  ) => {
    logger.error({
      error: {
        url: request.url,
        method: request.method,
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
    done()
  }
}

export default logger
