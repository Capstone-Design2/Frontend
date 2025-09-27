import { z } from 'zod'

const users: { id: string; username: string; email: string; password: string }[] = []

const signupSchema = z.object({ username: z.string().min(3), email: z.string().email(), password: z.string().min(6) })
const loginSchema = z.object({ username: z.string().min(3), password: z.string().min(6) })

function b64url(input: string) {
  return btoa(input).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')
}

function makeToken(payload: Record<string, any>) {
  const header = b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const signature = ''
  return `${header}.${body}.${signature}`
}

export async function signupApi(payload: unknown) {
  const data = signupSchema.parse(payload)
  if (users.some(u => u.username === data.username)) throw new Error('Username already exists')
  const user = { id: crypto.randomUUID(), ...data }
  users.push(user)
  return { ok: true }
}

export async function loginApi(payload: unknown) {
  const data = loginSchema.parse(payload)
  const user = users.find(u => u.username === data.username && u.password === data.password)
  if (!user) throw new Error('Invalid credentials')
  const token = makeToken({ sub: user.id, username: user.username, email: user.email, exp: Math.floor(Date.now()/1000)+3600 })
  return { token }
}

export async function meApi(token: string) {
  const parts = token.split('.')
  if (parts.length < 2) throw new Error('Invalid token')
  const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))
  const u = users.find(x => x.id === payload.sub)
  if (!u) throw new Error('User not found')
  return { id: u.id, email: u.email, username: u.username }
}

export async function checkId(username: string) {
  return { exists: users.some(u => u.username === username) }
}
