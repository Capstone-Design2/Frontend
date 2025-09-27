# Atlas Trade — Retail Trading Dashboard

Vue 3 + Vite + TypeScript app implementing a trading dashboard with mock auth, strategy management (front-end), backtesting (client-side), and realtime charts.

## Stack
- Vue 3 + Vite + TypeScript
- Pinia, Vue Router (lazy routes, auth guards)
- TailwindCSS, PostCSS, Autoprefixer
- axios, socket.io-client (mocked), lightweight-charts
- date-fns, zod, jwt-decode
- Vitest + @vue/test-utils + happy-dom

## Setup
1) Copy env and set your key
```bash
cp .env.example .env
# set VITE_ALPHA_VANTAGE_KEY=your_key
```
2) Install and run
```bash
npm i
npm run dev
```
3) Tests
```bash
npm run test:unit
```

## ENV
- VITE_ALPHA_VANTAGE_KEY: Your Alpha Vantage API key
- Alpha Vantage base: src/config.ts (ALPHA_VANTAGE_BASE)
- Polling defaults: src/config.ts (POLLING_DEFAULTS)

## Mock services
- src/mock/api.ts: signup/login/id check using zod. Replace with real backend later.
- src/mock/socket.ts: socket.io-like quotes stream via setInterval. Swap with real WS later.

## Services
- src/services/http.ts: axios instance with JWT header & error normalization
- src/services/alphaVantage.ts: Daily/Intraday fetch + indicator helpers with simple cache

## State (Pinia)
- useAuthStore: token+user, login/signup/logout/restore (localStorage)
- useMarketStore: selectedSymbol, mini tickers, live price, subscribe/unsubscribe, fallbackPoll
- useStrategyStore: CRUD strategies (localStorage)
- useBacktestStore: runBacktest (simple) + results (localStorage)
- useUiStore: kill switch, toasts, theme

## Routing
Public: `/`, `/login`, `/signup` — Protected: strategies/backtest/mypage — NotFound route. Global afterEach closes overlays.

## Strategy Schema
Strategies are stored with a schemaVersion for forward compatibility. Example JSON:

```json
{
  "schemaVersion": 1,
  "name": "My Strat",
  "description": "Demo",
  "indicators": { "sma": { "enabled": true, "period": 20 }, "rsi": { "enabled": true, "period": 14 } },
  "rules": { "buy": ["smaCrossPriceUp", "rsi<30"], "sell": ["smaCrossPriceDown"], "stopLoss": 5, "takeProfit": 10 },
  "positionSizing": { "mode": "percent", "value": 10 }
}
```

## Notes
- Alpha Vantage rate limits apply; sidebar includes notes for unsupported symbols (KOSPI/KOSDAQ/DXY).
- Replace mock auth and websocket with real services as needed.

## License
Educational purposes only; no financial advice.
