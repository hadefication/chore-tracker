const PARENT_SESSION_KEY = 'chore-tracker-parent-session'

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function hasParentSession(): boolean {
  if (!canUseSessionStorage()) {
    return false
  }

  return window.sessionStorage.getItem(PARENT_SESSION_KEY) === 'active'
}

export function startParentSession(): void {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.setItem(PARENT_SESSION_KEY, 'active')
}

export function clearParentSession(): void {
  if (!canUseSessionStorage()) {
    return
  }

  window.sessionStorage.removeItem(PARENT_SESSION_KEY)
}
