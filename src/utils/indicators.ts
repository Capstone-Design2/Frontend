export function sma(values: number[], period: number): number[] {
  const out: number[] = []
  for (let i=0;i<values.length;i++) {
    if (i+1<period) { out.push(NaN); continue }
    const slice = values.slice(i+1-period, i+1)
    out.push(slice.reduce((a,b)=>a+b,0)/period)
  }
  return out
}

export function ema(values: number[], period: number): number[] {
  const out: number[] = []
  const k = 2/(period+1)
  let prev = values[0]
  for (let i=0;i<values.length;i++) {
    if (i===0) out.push(prev)
    else { const next = values[i]*k + prev*(1-k); out.push(next); prev = next }
  }
  return out
}

export function rsi(values: number[], period: number): number[] {
  const out: number[] = []
  let gains=0, losses=0
  for (let i=1;i<values.length;i++) {
    const change = values[i]-values[i-1]
    gains += Math.max(0, change)
    losses += Math.max(0, -change)
    if (i<period) { out.push(NaN); continue }
    if (i===period) { gains/=period; losses/=period }
    else {
      gains = (gains*(period-1)+Math.max(0,change))/period
      losses = (losses*(period-1)+Math.max(0,-change))/period
    }
    const rs = losses===0 ? 100 : gains/losses
    const r = 100 - (100/(1+rs))
    out.push(r)
  }
  out.unshift(NaN)
  return out
}

export function macd(values: number[], fast=12, slow=26, signal=9) {
  const emaFast = ema(values, fast)
  const emaSlow = ema(values, slow)
  const macdLine = values.map((_,i)=> emaFast[i]-emaSlow[i])
  const signalLine = ema(macdLine, signal)
  const histogram = macdLine.map((v,i)=> v - signalLine[i])
  return { macdLine, signalLine, histogram }
}

export function bbands(values: number[], period=20, dev=2) {
  const m = sma(values, period)
  const upper: number[] = []
  const lower: number[] = []
  for (let i=0;i<values.length;i++) {
    if (i+1<period) { upper.push(NaN); lower.push(NaN); continue }
    const slice = values.slice(i+1-period, i+1)
    const mean = m[i]
    const variance = slice.reduce((acc,v)=> acc + (v-mean)**2, 0) / period
    const sd = Math.sqrt(variance)
    upper.push(mean + dev*sd)
    lower.push(mean - dev*sd)
  }
  return { middle: m, upper, lower }
}
