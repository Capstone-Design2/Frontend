import { z } from 'zod'

const users: { id: string; username: string; email: string; password: string }[] = []

const signupSchema = z.object({
  username: z.string().min(3, { message: '사용자 이름은 3자 이상이어야 합니다.' }),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
  password: z.string().min(6, { message: '비밀번호는 6자 이상이어야 합니다.' }),
})
const loginSchema = z.object({
  username: z.string().min(3, { message: '사용자 이름은 3자 이상이어야 합니다.' }),
  password: z.string().min(6, { message: '비밀번호는 6자 이상이어야 합니다.' }),
})
const updateUserSchema = z.object({
  username: z.string().min(3, { message: '사용자 이름은 3자 이상이어야 합니다.' }),
  email: z.string().email({ message: '유효한 이메일 주소를 입력해주세요.' }),
})

function b64url(input: string) {
  return btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function makeToken(payload: Record<string, any>) {
  const header = b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const signature = ''
  return `${header}.${body}.${signature}`
}

export async function signupApi(payload: unknown) {
  const data = signupSchema.parse(payload)
  if (users.some((u) => u.username === data.username))
    throw new Error('이미 존재하는 사용자 이름입니다.')
  const user = { id: crypto.randomUUID(), ...data }
  users.push(user)
  return { ok: true }
}

export async function loginApi(payload: unknown) {
  const data = loginSchema.parse(payload)
  const user = users.find((u) => u.username === data.username && u.password === data.password)
  if (!user) throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
  const token = makeToken({
    sub: user.id,
    username: user.username,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })
  return { token }
}

export async function updateUserApi(userId: string, payload: unknown) {
  const data = updateUserSchema.parse(payload)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex === -1) {
    throw new Error('사용자를 찾을 수 없습니다.')
  }

  if (users.some((u) => u.username === data.username && u.id !== userId)) {
    throw new Error('이미 존재하는 사용자 이름입니다.')
  }

  users[userIndex] = { ...users[userIndex], ...data }
  return {
    id: users[userIndex].id,
    username: users[userIndex].username,
    email: users[user - index].email,
  }
}

export async function meApi(token: string) {
  const parts = token.split('.')
  if (parts.length < 2) throw new Error('Invalid token')
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
  const u = users.find((x) => x.id === payload.sub)
  if (!u) throw new Error('사용자를 찾을 수 없습니다.')
  return { id: u.id, email: u.email, username: u.username }
}

export async function checkId(username: string) {
  return { exists: users.some((u) => u.username === username) }
}
