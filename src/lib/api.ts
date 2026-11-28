import axios, { type AxiosRequestConfig } from "axios"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://weinvite.freddylabs.my.id"

const ACCESS_TOKEN_KEY = "winvit_access_token"
const REFRESH_TOKEN_KEY = "winvit_refresh_token"
const AUTH_USER_KEY = "winvit_user"

export interface JwtClaims {
  uid: string
  role: "admin" | "user"
  typ: string
  sub: string
  exp: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (raw) {
      return JSON.parse(raw) as AuthUser
    }
    const token = getAccessToken()
    if (!token) return null
    const claims = decodeJwt(token)
    if (!claims) return null
    return {
      id: claims.uid,
      name: claims.role === "admin" ? "Admin" : "Customer",
      email: "",
      role: claims.role,
      is_active: true,
    }
  } catch {
    return null
  }
}

export function setTokens(accessToken: string, refreshToken?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    )
    return payload as JwtClaims
  } catch {
    return null
  }
}

// Axios Instance Utama
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor: Otomatis pasang Bearer Token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && config.headers && config.headers.Authorization === undefined) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    )
    const json = res.data
    const newAccess =
      json?.data?.tokens?.access_token ||
      json?.data?.access_token ||
      json?.access_token
    const newRefresh =
      json?.data?.tokens?.refresh_token ||
      json?.data?.refresh_token ||
      json?.refresh_token
    if (newAccess) {
      setTokens(newAccess, newRefresh)
      return newAccess
    }
    clearTokens()
    return null
  } catch {
    clearTokens()
    return null
  }
}

function extractErrorMessage(data: any, fallbackMessage: string): Error {
  const message =
    data?.error?.message ||
    (typeof data?.error === "string" ? data.error : undefined) ||
    data?.message ||
    fallbackMessage

  return new Error(String(message))
}

// Response Interceptor: Auto Refresh Token saat 401 & Unwrap Error Message
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === false) {
      return Promise.reject(
        extractErrorMessage(response.data, "Request failed")
      )
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean
    }

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh")

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      originalRequest &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true
      const refreshedToken = await refreshAccessToken()
      if (refreshedToken) {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${refreshedToken}`,
        }
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(
      extractErrorMessage(error.response?.data, error.message)
    )
  }
)

function unwrap<T>(resData: any): T {
  return (resData?.data !== undefined ? resData.data : resData) as T
}

// ==========================================
// 1. AUTH API
// ==========================================
export interface AuthTokensResponse {
  user?: AuthUser
  tokens?: {
    access_token: string
    access_expires_at?: string
    refresh_token?: string
    refresh_expires_at?: string
  }
  access_token?: string
  refresh_token?: string
}

export async function loginApi(email: string, password: string) {
  const res = await apiClient.post("/api/v1/auth/login", { email, password })
  const data = unwrap<AuthTokensResponse>(res.data)
  const accessToken = data?.tokens?.access_token || data?.access_token || ""
  const refreshToken = data?.tokens?.refresh_token || data?.refresh_token
  if (accessToken) {
    setTokens(accessToken, refreshToken)
  }
  if (data?.user) {
    setAuthUser(data.user)
  }
  return {
    user: data?.user || null,
    accessToken,
    refreshToken,
    claims: decodeJwt(accessToken),
  }
}

export async function registerApi(name: string, email: string, password: string) {
  const res = await apiClient.post("/api/v1/auth/register", {
    name,
    email,
    password,
  })
  const data = unwrap<AuthTokensResponse>(res.data)
  const accessToken = data?.tokens?.access_token || data?.access_token || ""
  const refreshToken = data?.tokens?.refresh_token || data?.refresh_token
  if (accessToken) {
    setTokens(accessToken, refreshToken)
  }
  if (data?.user) {
    setAuthUser(data.user)
  }
  return {
    user: data?.user || null,
    accessToken,
    refreshToken,
    claims: decodeJwt(accessToken),
  }
}

// ==========================================
// 2. UPLOAD PRESIGN API
// ==========================================
export interface PresignResponse {
  upload_url: string
  file_url?: string
  public_url?: string
  url?: string
  fields: Record<string, string>
}

export async function uploadMediaFile(file: File): Promise<string> {
  const res = await apiClient.post("/api/v1/uploads/presign", {
    content_type: file.type || "image/png",
  })
  const presign = unwrap<PresignResponse>(res.data)

  const formData = new FormData()
  if (presign.fields) {
    Object.entries(presign.fields).forEach(([k, v]) => {
      formData.append(k, v)
    })
  }
  formData.append("file", file)

  await axios.post(presign.upload_url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  if (presign.file_url) return presign.file_url
  if (presign.public_url) return presign.public_url
  if (presign.url) return presign.url
  const key = presign.fields?.key || file.name
  const base = presign.upload_url.replace(/\/$/, "")
  return `${base}/${key}`
}

// ==========================================
// 3. INVITATION API
// ==========================================
export interface BackendInvitationPayload {
  slug: string
  groom_name: string
  groom_info: string
  groom_photo_url: string
  bride_name: string
  bride_info: string
  bride_photo_url: string
  cover_photo_url: string
  music_url: string
  quote_preset?: string
  is_published: boolean
}

export async function getInvitationsApi() {
  const res = await apiClient.get("/api/v1/invitations")
  return unwrap<any>(res.data)
}

export async function updateInvitationApi(
  id: string,
  payload: Partial<BackendInvitationPayload>
) {
  const res = await apiClient.patch(`/api/v1/invitations/${id}`, payload)
  return unwrap<any>(res.data)
}

export async function getPublicInvitationBySlugApi(slug: string) {
  const res = await apiClient.get(`/api/v1/public/invitations/${slug}`)
  return unwrap<any>(res.data)
}

// ==========================================
// 4. EVENT API
// ==========================================
export interface BackendEventPayload {
  invitation_id: string
  name: string
  start_time: string
  end_time: string
  location_name: string
  location_address: string
  location_url: string
  sort_order: number
}

export async function getEventsApi(invitationId: string) {
  const res = await apiClient.get("/api/v1/events", {
    params: { invitation_id: invitationId },
  })
  return unwrap<any[]>(res.data)
}

export async function createEventApi(payload: BackendEventPayload) {
  const res = await apiClient.post("/api/v1/events", payload)
  return unwrap<any>(res.data)
}

export async function updateEventApi(
  id: string,
  payload: Omit<BackendEventPayload, "invitation_id">
) {
  const res = await apiClient.patch(`/api/v1/events/${id}`, payload)
  return unwrap<any>(res.data)
}

export async function deleteEventApi(id: string) {
  const res = await apiClient.delete(`/api/v1/events/${id}`)
  return unwrap<any>(res.data)
}

// ==========================================
// 5. LOVE STORY API
// ==========================================
export interface BackendStoryPayload {
  invitation_id: string
  title: string
  story: string
  story_date: string | null
  date_label: string
  image_url: string
  sort_order: number
}

export async function getStoriesApi(invitationId: string) {
  const res = await apiClient.get("/api/v1/stories", {
    params: { invitation_id: invitationId },
  })
  return unwrap<any[]>(res.data)
}

export async function createStoryApi(payload: BackendStoryPayload) {
  const res = await apiClient.post("/api/v1/stories", payload)
  return unwrap<any>(res.data)
}

export async function updateStoryApi(
  id: string,
  payload: Omit<BackendStoryPayload, "invitation_id">
) {
  const res = await apiClient.patch(`/api/v1/stories/${id}`, payload)
  return unwrap<any>(res.data)
}

export async function deleteStoryApi(id: string) {
  const res = await apiClient.delete(`/api/v1/stories/${id}`)
  return unwrap<any>(res.data)
}

// ==========================================
// 6. GALLERY API
// ==========================================
export interface BackendGalleryPayload {
  invitation_id: string
  media_type: string
  media_url: string
  sort_order: number
}

export async function getGalleriesApi(invitationId: string) {
  const res = await apiClient.get("/api/v1/galleries", {
    params: { invitation_id: invitationId },
  })
  return unwrap<any[]>(res.data)
}

export async function createGalleryApi(payload: BackendGalleryPayload) {
  const res = await apiClient.post("/api/v1/galleries", payload)
  return unwrap<any>(res.data)
}

export async function deleteGalleryApi(id: string) {
  const res = await apiClient.delete(`/api/v1/galleries/${id}`)
  return unwrap<any>(res.data)
}

// ==========================================
// 7. GIFT API
// ==========================================
export interface BackendGiftPayload {
  invitation_id: string
  account_name: string
  account_number: string
  on_behalf_of: string
  sort_order: number
}

export async function getGiftsApi(invitationId: string) {
  const res = await apiClient.get("/api/v1/gifts", {
    params: { invitation_id: invitationId },
  })
  return unwrap<any[]>(res.data)
}

export async function createGiftApi(payload: BackendGiftPayload) {
  const res = await apiClient.post("/api/v1/gifts", payload)
  return unwrap<any>(res.data)
}

export async function deleteGiftApi(id: string) {
  const res = await apiClient.delete(`/api/v1/gifts/${id}`)
  return unwrap<any>(res.data)
}

// ==========================================
// 8. GUEST API
// ==========================================
export interface BackendGuest {
  id: string
  invitation_id: string
  name: string
  created_at: string
}

export async function getGuestsApi(invitationId: string) {
  const res = await apiClient.get("/api/v1/guests", {
    params: { invitation_id: invitationId },
  })
  return unwrap<BackendGuest[]>(res.data)
}

export async function createGuestApi(invitationId: string, name: string) {
  const res = await apiClient.post("/api/v1/guests", {
    invitation_id: invitationId,
    name,
  })
  return unwrap<BackendGuest>(res.data)
}

export async function deleteGuestApi(id: string) {
  const res = await apiClient.delete(`/api/v1/guests/${id}`)
  return unwrap<any>(res.data)
}

// ==========================================
// 9. USER API
// ==========================================
export async function getMeApi() {
  const res = await apiClient.get("/api/v1/users/me")
  return unwrap<any>(res.data)
}

export async function getUserByIdApi(id: string) {
  const res = await apiClient.get(`/api/v1/users/${id}`)
  return unwrap<any>(res.data)
}

export async function updateUserApi(
  id: string,
  payload: {
    name?: string
    email?: string
    password?: string
    role?: string
    is_active?: boolean
  }
) {
  const res = await apiClient.patch(`/api/v1/users/${id}`, payload)
  return unwrap<any>(res.data)
}

export async function getUsersApi(params?: {
  page?: number
  per_page?: number
  search?: string
  role?: string
}) {
  const res = await apiClient.get("/api/v1/users", { params })
  return unwrap<any>(res.data)
}

export async function createUserApi(payload: {
  name: string
  email: string
  password: string
  role: "user" | "admin"
}) {
  const res = await apiClient.post("/api/v1/users", payload)
  return unwrap<any>(res.data)
}

// ==========================================
// 10. ORDER API
// ==========================================
export interface PlaceOrderPayload {
  theme_id: string
  customer_name: string
  email: string
  whatsapp: string
  referral_code?: string
}

export async function placeOrderApi(payload: PlaceOrderPayload) {
  const res = await apiClient.post("/api/v1/public/place-order", payload)
  return unwrap<any>(res.data)
}

export async function getOrdersApi(params?: {
  page?: number
  per_page?: number
  search?: string
  status?: string
}) {
  const res = await apiClient.get("/api/v1/orders", {
    params: {
      page: params?.page || 1,
      per_page: params?.per_page || 25,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status ? { status: params.status } : {}),
    },
  })
  return unwrap<any>(res.data)
}

export async function approvalOrderApi(
  id: string,
  payload: { status: "approved" | "rejected"; reason: string }
) {
  const res = await apiClient.patch(`/api/v1/orders/${id}`, payload)
  return unwrap<any>(res.data)
}

// ==========================================
// 11. THEME API
// ==========================================
export interface BackendThemePayload {
  name: string
  thumbnail_url: string
  thumbnail_mobile_url?: string | null
  thumbnail_tab_url?: string | null
  price: number
  tag: string
  is_active?: boolean
}

export async function getPublicThemesApi(params?: {
  page?: number
  per_page?: number
  search?: string
  tag?: string
}) {
  const res = await apiClient.get("/api/v1/public/themes", {
    params: {
      page: params?.page || 1,
      per_page: params?.per_page || 50,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.tag ? { tag: params.tag } : {}),
    },
  })
  return unwrap<any>(res.data)
}

export async function getAdminThemesApi(params?: {
  page?: number
  per_page?: number
  search?: string
  tag?: string
}) {
  const res = await apiClient.get("/api/v1/themes", {
    params: {
      page: params?.page || 1,
      per_page: params?.per_page || 50,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.tag ? { tag: params.tag } : {}),
    },
  })
  return unwrap<any>(res.data)
}

export async function createThemeApi(payload: BackendThemePayload) {
  const res = await apiClient.post("/api/v1/themes", payload)
  return unwrap<any>(res.data)
}

export async function updateThemeApi(
  id: string,
  payload: Partial<BackendThemePayload>
) {
  const res = await apiClient.patch(`/api/v1/themes/${id}`, payload)
  return unwrap<any>(res.data)
}

// ==========================================
// 12. WISH API (PUBLIC UCAPAN & DOA)
// ==========================================
export interface BackendWish {
  id: string
  invitation_id: string
  guest_name: string
  message: string
  created_at: string
}

export interface CreateWishPayload {
  slug: string
  guest_name: string
  message: string
}

export async function getWishesBySlugApi(slug: string) {
  const res = await apiClient.get(
    `/api/v1/public/wishes/${encodeURIComponent(slug)}`
  )
  return unwrap<BackendWish[]>(res.data)
}

export async function createWishApi(payload: CreateWishPayload) {
  const res = await apiClient.post("/api/v1/public/wishes", payload)
  return unwrap<BackendWish>(res.data)
}
