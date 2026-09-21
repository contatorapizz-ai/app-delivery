const KEY = 'rapizz.ad_session'

export function getAdSessionId(): string {
  try {
    let id = window.localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      window.localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}
