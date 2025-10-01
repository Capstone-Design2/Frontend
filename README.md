# CAPSLOCK - 리테일 트레이딩 대시보드

Vue 3, Vite, TypeScript로 구축된 기능이 풍부한 트레이딩 대시보드입니다. 이 애플리케이션을 통해 사용자는 인터랙티브한 주식 차트를 보고, 규칙 기반 트레이딩 전략을 생성 및 관리하며, 과거 데이터를 기반으로 간단한 백테스트를 실행할 수 있습니다.

## 주요 기능

- **인터랙티브 차트**: 거래량을 포함하고 다양한 시간 간격을 지원하는 [TradingView's Lightweight Charts](https://www.tradingview.com/lightweight-charts/) 기반의 실시간 주식 차트.
- **동적 심볼 검색**: Alpha Vantage API를 사용하여 주식 심볼을 찾는 자동 완성 기능이 포함된 네비게이션 바 검색 기능.
- **전략 관리**: 규칙 기반 빌더를 사용하여 사용자 정의 트레이딩 전략을 생성, 조회, 수정 및 삭제. 전략은 브라우저의 로컬 스토리지에 저장됩니다.
- **클라이언트 사이드 백테스팅**: 과거 데이터에 대해 전략을 기반으로 간단한 백테스트를 실행.
- **모의 인증**: 개발 목적으로 완전한 사용자 인증 흐름(회원가입, 로그인, 로그아웃)을 모의로 구현.
- **중앙 집중식 상태 관리**: Pinia를 사용한 깔끔하고 예측 가능한 상태 관리.
- **모던 & 반응형 UI**: TailwindCSS로 구축된 다크 테마의 반응형 인터페이스.

## 기술 스택

- **프레임워크**: Vue 3 (Composition API 및 `<script setup>` 사용)
- **빌드 도구**: Vite
- **언어**: TypeScript
- **상태 관리**: Pinia
- **라우팅**: Vue Router
- **스타일링**: TailwindCSS
- **차트**: Lightweight Charts
- **HTTP 클라이언트**: Axios

## 프로젝트 설정

1.  **저장소 복제**

2.  **환경 변수 설정**

    `Frontend` 디렉토리의 루트에 `.env` 파일을 만들고 Alpha Vantage API 키를 추가합니다.

    ```
    VITE_ALPHA_VANTAGE_KEY=YOUR_API_KEY_HERE
    ```

3.  **의존성 설치 및 개발 서버 실행**

```bash
npm install
npm run dev
```

4. **Tests**

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
  "indicators": {
    "sma": { "enabled": true, "period": 20 },
    "rsi": { "enabled": true, "period": 14 }
  },
  "rules": {
    "buy": ["smaCrossPriceUp", "rsi<30"],
    "sell": ["smaCrossPriceDown"],
    "stopLoss": 5,
    "takeProfit": 10
  },
  "positionSizing": { "mode": "percent", "value": 10 }
}
```

## Notes

- Alpha Vantage rate limits apply; sidebar includes notes for unsupported symbols (KOSPI/KOSDAQ/DXY).
- Replace mock auth and websocket with real services as needed.

## License

Educational purposes only; no financial advice.
