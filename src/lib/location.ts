import { readJSON, writeJSON } from './storage'

const ADDRESS_KEY = 'rapizz.address.v1'
export const ADDRESS_CHANGED_EVENT = 'rapizz:address-changed'

export function getLocalAddress(): string {
  return readJSON(ADDRESS_KEY, '')
}

export function setLocalAddress(address: string): void {
  writeJSON(ADDRESS_KEY, address)
  window.dispatchEvent(new Event(ADDRESS_CHANGED_EVENT))
}
