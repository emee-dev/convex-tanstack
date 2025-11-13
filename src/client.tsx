import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import * as Sentry from '@sentry/react'
import { getRouter } from './router'
import { initSentry } from './sentry'

// skip if DSN undefined
initSentry()

const router = getRouter()

const AppComponent = process.env.VITE_SENTRY_DSN
  ? Sentry.withErrorBoundary(StartClient, {
      fallback: () => (
        <div>An error has occurred. Our team has been notified.</div>
      ),
    })
  : StartClient

hydrateRoot(document, <AppComponent router={router} />)
