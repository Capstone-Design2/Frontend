import http from '@/services/http'

export interface LoginReq {
  username: string
  password: string
}
export interface SignupReq {
  email: string
  name: string
  password: string
}
export interface UpdateUserReq {
  email: string
  name: string
}

export interface User {
  id: string
  email: string
  name: string
}

export interface LoginRes {
  token: string
}

function pickToken(data: unknown): string {
  // 백엔드가 어떤 필드명을 쓰든 여기서 표준화
  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>
    if (typeof d.token === 'string') return d.token
    if (typeof d.access_token === 'string') return d.access_token
    if (typeof d.accessToken === 'string') return d.accessToken
  }
  throw new Error('Invalid login response: token missing')
}

export async function signupApi(req: SignupReq): Promise<void> {
  await http.post('/user/', req)
}

export async function loginApi(req: LoginReq): Promise<LoginRes> {
  const params = new URLSearchParams()
  params.append('username', req.username)
  params.append('password', req.password)
  const res = await http.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  const token = pickToken(res.data)
  return { token }
}

export async function meApi(): Promise<User> {
  // http 인터셉터가 Authorization 헤더를 붙여줌
  const res = await http.get('/auth/me')
  const data = res.data as { id?: string; user_id?: number; email: string; name: string }

  // 백엔드가 user_id 또는 id를 반환할 수 있으므로 처리
  const userId = data.id || (data.user_id ? String(data.user_id) : '')

  return {
    id: userId,
    email: data.email,
    name: data.name,
  }
}

export async function updateUserApi(userId: string, req: UpdateUserReq): Promise<User> {
  const res = await http.put(`/user/${encodeURIComponent(userId)}`, req)
  const data = res.data as { id?: string; user_id?: number; email: string; name: string }

  // 백엔드가 user_id 또는 id를 반환할 수 있으므로 처리
  const id = data.id || (data.user_id ? String(data.user_id) : '')

  return {
    id,
    email: data.email,
    name: data.name,
  }
}
