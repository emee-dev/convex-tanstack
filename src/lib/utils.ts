import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDeployed = import.meta.env?.IS_DEPOYED === 'true'
export const isDeployedOnCloudflare =
  import.meta.env?.IS_DEPLOYED_ON_CLOUDFLARE === 'true'
