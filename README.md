# CAPSLOCK Frontend

CAPSLOCK 프론트엔드는 **Vue 3 + TypeScript + Vite** 기반으로 구축된
리테일 트레이더용 고성능 트레이딩 대시보드입니다.

실시간 가격 표시, 전략 편집, 백테스팅, 모의투자 등
**완전한 트레이딩 워크플로우**를 웹 환경에서 제공합니다.

---

# 📁 프로젝트 구조

```
src/
├── assets/                  # 정적 리소스 (아이콘, 전역 CSS 등)
│   └── icons/chat.svg
│
├── components/              # UI 컴포넌트 (도메인 기반)
│   ├── Chart/
│   │   ├── ChartToolbar.vue
│   │   ├── OverlayCanvas.vue
│   │   └── PriceChart.vue
│   ├── Chat/
│   │   ├── ActiveChatView.vue
│   │   ├── ChatPanel.vue
│   │   ├── EmptyChatView.vue
│   │   ├── MessageInput.vue
│   │   └── MessageList.vue
│   ├── Common/
│   │   ├── AppNavbar.vue
│   │   ├── EmptyState.vue
│   │   ├── Footer.vue
│   │   ├── Modal.vue
│   │   ├── ProtectedView.vue
│   │   ├── Toast.vue
│   │   └── ToastContainer.vue
│   ├── Sidebar/
│   │   ├── AccountBalanceWidget.vue
│   │   ├── PositionsWidget.vue
│   │   └── TradeWidget.vue
│   └── Strategy/
│       ├── ConditionGroup.vue
│       ├── ConditionList.vue
│       ├── FlowList.vue
│       └── RuleBuilder.vue
│
├── pages/                   # 라우트 기반 페이지
│   ├── Backtest/
│   │   ├── History.vue
│   │   ├── Results.vue
│   │   └── Run.vue
│   ├── Strategies/
│   │   ├── Create.vue
│   │   ├── Detail.vue
│   │   ├── Edit.vue
│   │   └── List.vue
│   ├── DashboardView.vue
│   ├── LoginView.vue
│   ├── MyPageView.vue
│   ├── NotFound.vue
│   └── SignupView.vue
│
├── router/
│   └── index.ts             # 페이지 라우팅
│
├── services/                # API & 도메인 서비스 계층
│   ├── strategy/strategyApi.ts
│   ├── authApi.ts
│   ├── backtestApi.ts
│   ├── http.ts
│   ├── marketApi.ts
│   ├── marketIntraday.ts
│   ├── paperTradingApi.ts
│   ├── tvSymbolApi.ts
│   └── websocket.ts
│
├── stores/                  # Pinia 상태 관리
│   ├── useAuthStore.ts
│   ├── useBacktestStore.ts
│   ├── useMarketStore.ts
│   ├── usePortfolioStore.ts
│   ├── useStrategyStore.ts
│   └── useUiStore.ts
│
├── styles/
│   └── index.css
│
├── types/                   # TypeScript 타입 정의
│   ├── Backtest.ts
│   └── Strategy.ts
│
├── utils/                   # 유틸리티 함수
│   ├── indicators.ts
│   ├── strategyValidator.ts
│   └── validation.ts
│
├── App.vue
├── config.ts
├── env.d.ts
├── main.ts
└── vite-env.d.ts

tests/                       # Vitest 기반 단위 테스트
├── auth.store.test.ts
├── strategy.rulebuilder.test.ts
└── utils.sma.test.ts
```

---

# ✨ 주요 기능

## 📊 1. 실시간 가격 차트 시스템

* Lightweight Charts 기반 고성능 차트
* OverlayCanvas로 실시간 오버레이 지원
* 차트 툴바 (`ChartToolbar.vue`) 제공
* WebSocket 기반 실시간 가격 스트림
  - 구독/해제 관리
  - reconnect 및 heartbeat 처리
  - Pinia Store 연동


## 🔍 2. 종목/시세/심볼 관리

* `marketApi` + `tvSymbolApi`
* Intraday/Polling 혼합 전략 (`marketIntraday.ts`)

## 🧩 3. 전략 생성 & 규칙 빌더

* 선언적 Rule Builder UI
  - 조건 그룹 (AND / OR)
  - 중첩 조건 지원
  - Flow 기반 전략 구성
* 전략 CRUD (`strategyApi.ts`)
* 프론트 단에서 전략 구조 유효성 검증 (`strategyValidator.ts`)
* 전략 타입 분리 (`types/Strategy.ts`)

## 📈 4. 백테스팅 모듈

* 실행(런), 결과, 히스토리 페이지 제공
* SMA·RSI 등 기술 지표 (`indicators.ts`)
* 백엔드 연산 결과 시각화
* 프론트 단 결과 요약 및 메트릭 렌더링


## 🧪 5. 모의투자 / 포트폴리오

* 주문/체결/포지션 간단 모델링
* `paperTradingApi.ts`
* `usePortfolioStore.ts`로 상태 통합

## 🔐 6. 인증 & 접근 제어

* 로그인/가입/세션 복원
* ProtectedView를 통한 라우트 보호
* JWT 기반 헤더 자동 부착 (`http.ts`)

## 🎨 7. 유틸리티 클래스 기반 반응형 UI

* Navbar / Sidebar / Toast 시스템
* 모달/알림/공통 컴포넌트 포함

---

# ⚙️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

루트에 `.env` 생성:

```
API_BASE_URL=YOUR_API_URL
```
⚠️ `.env` 파일은 Git에 커밋하지 마세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
npm run preview
```

---

# 🧱 아키텍처 개요

## 1. Presentation Layer

* `pages/`
* `components/`
  UI & UX 중심

## 2. State Layer (Pinia)

* 인증 / 시세 / 전략 / 백테스트 / UI / 포트폴리오

## 3. Service Layer

* API 통신 (`strategyApi`, `authApi`, `marketApi`)
* WebSocket
* Intraday Polling
* Strategy Logic

## 4. Utilities / Types

* indicators, validator, forms
* TS 기반 엄격한 유형 정의

---

# 🧪 테스트

Vitest 기반 단위 테스트:

```bash
npm run test
npm run test:unit
```

테스트 커버리지 (옵션):

```bash
npm run coverage
```

---

# 🛠️ 개발 스크립트

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 로컬 미리보기
npm run lint       # ESLint 검사
npm run test       # 전체 테스트
```

---

# 📄 라이선스

MIT License
트레이딩 관련 기능은 교육 목적이며, 투자 조언을 제공하지 않습니다.

---
