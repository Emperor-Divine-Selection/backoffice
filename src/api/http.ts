import { clearToken, getToken } from './token'

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface ApiResponse<T> {
  code: number
  msg: string
  data: T | null
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${BASE}${path}`, { ...init, headers })

  let body: ApiResponse<T>
  try {
    body = await response.json()
  } catch {
    throw new Error(`服务异常（HTTP ${response.status}）`)
  }

  if (body.code !== 200 && body.code !== 201) {
    // 登录失败也是 401，在 /login 页就别再跳了，否则页面重载、错误提示瞬间消失
    if (body.code === 401 && window.location.pathname !== '/login') {
      clearToken()
      window.location.assign('/login')
    }
    throw new Error(body.msg)
  }

  return body.data as T
}
