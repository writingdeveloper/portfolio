export interface TelemetryEnvironment {
  VERCEL_ENV?: string
  PORTFOLIO_ENABLE_TELEMETRY?: string
}

/** Local/previews must not request Vercel-only endpoints or pollute real visitor analytics. */
export function telemetryPolicy(env: TelemetryEnvironment, host: string | null) {
  const canonicalHost = host?.toLowerCase().replace(/:443$/, '') === 'writingdeveloper.blog'
  const publicProduction = canonicalHost && (env.VERCEL_ENV === 'production' || env.PORTFOLIO_ENABLE_TELEMETRY === '1')
  return { thirdParty: publicProduction, vercel: publicProduction && env.VERCEL_ENV === 'production' }
}
