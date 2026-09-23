import { DEFAULT_CITY } from '../data/cities'
import { readJSON, writeJSON } from './storage'

const CITY_KEY = 'rapizz.city.v1'
export const CITY_CHANGED_EVENT = 'rapizz:city-changed'

export function getSelectedCity(): string {
  return readJSON(CITY_KEY, DEFAULT_CITY)
}

export function setSelectedCity(city: string): void {
  writeJSON(CITY_KEY, city)
  window.dispatchEvent(new Event(CITY_CHANGED_EVENT))
}
