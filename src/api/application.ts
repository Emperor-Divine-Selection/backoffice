import { request } from './http'

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface MerchantApplication {
  id: string
  shop_name: string
  status: ApplicationStatus
  username: string | null
  reviewer_name: string | null
  review_remark: string | null
  create_time: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}


export function listApplications(params: {
  status?: ApplicationStatus
  keyword?: string
  page?: number
  page_size?: number
}) {
  const query = toQueryString(params)                    // ApplicationStatus 是 string 的子类型，能传
  return request<PageResult<MerchantApplication>>(
    `/backoffice/applications${query ? `?${query}` : ''}`,
  )
}


function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    query.set(key, String(value))
  }
  return query.toString()
}

export function approveApplication(id: string, remark?: string) {
  return request<MerchantApplication>(`/backoffice/applications/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ remark: remark || undefined }),
  })
}

export function rejectApplication(id: string, remark: string) {
  return request<MerchantApplication>(`/backoffice/applications/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ remark }),
  })
}
