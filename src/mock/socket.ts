type Handler = (price: number) => void

export function connectQuotes(symbol: string) {
  let price = 100 + Math.random()*50
  let t: number | null = null
  const handlers = new Set<Handler>()
  const start = () => {
    t = window.setInterval(() => {
      const drift = (Math.random()-0.5) * 0.5
      price = Math.max(1, price + drift)
      handlers.forEach(h => h(Number(price.toFixed(2))))
    }, 1000)
  }
  start()
  return {
    on(event: 'price', cb: Handler) { if (event==='price') handlers.add(cb) },
    off(event: 'price', cb: Handler) { if (event==='price') handlers.delete(cb) },
    close() { if (t) clearInterval(t); handlers.clear() }
  }
}
