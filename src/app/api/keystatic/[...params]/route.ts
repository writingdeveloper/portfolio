import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '../../../../../keystatic.config'
import { isKeystaticDisabled } from '@/lib/keystatic-access'

const handlers = makeRouteHandler({ config })

const notFound = () => new Response('Not Found', { status: 404 })

// Same guard as the /keystatic UI: in production local-storage mode the CMS
// route handler must not be reachable by anonymous visitors.
export const GET = (...args: Parameters<typeof handlers.GET>) =>
  isKeystaticDisabled() ? notFound() : handlers.GET(...args)

export const POST = (...args: Parameters<typeof handlers.POST>) =>
  isKeystaticDisabled() ? notFound() : handlers.POST(...args)
