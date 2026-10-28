const TOKEN_KEY = 'backoffice_token'
const storage = window.sessionStorage

export function getToken(): string | null {
  return storage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  storage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  storage.removeItem(TOKEN_KEY)
}
