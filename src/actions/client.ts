import { createClientOnlyFn } from '@tanstack/react-start'
import { ClientJS } from 'clientjs'

export const getFingerPrint = createClientOnlyFn(async () => {
  const clientJs = new ClientJS()
  return clientJs.getFingerprint()
})
