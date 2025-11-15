import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const Dashboard = () => import('@/pages/DashboardView.vue')
const Login = () => import('@/pages/LoginView.vue')
const Signup = () => import('@/pages/SignupView.vue')
const MyPage = () => import('@/pages/MyPageView.vue')
const NotFound = () => import('@/pages/NotFound.vue')

const StrategiesList = () => import('@/pages/Strategies/List.vue')
const StrategiesCreate = () => import('@/pages/Strategies/Create.vue')
const StrategiesEdit = () => import('@/pages/Strategies/Edit.vue')
const BacktestRun = () => import('@/pages/Backtest/Run.vue')
const BacktestResults = () => import('@/pages/Backtest/Results.vue')
const BacktestHistory = () => import('@/pages/Backtest/History.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', name: 'signup', component: Signup },
  {
    // '/strategies'와 관련된 라우트들을 중첩하여 그룹화합니다.
    path: '/strategies',
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // '/strategies' 경로에 해당합니다.
        name: 'strategies',
        component: StrategiesList,
      },
      {
        path: 'create', // '/strategies/create' 경로에 해당합니다.
        name: 'strategies-create',
        component: StrategiesCreate,
      },
      {
        path: ':id', // '/strategies/:id' 경로에 해당합니다.
        name: 'strategies-detail',
        component: () => import('@/pages/Strategies/Detail.vue'),
        props: true,
      },
      {
        path: ':id/edit', // '/strategies/:id/edit' 경로에 해당합니다.
        name: 'strategies-edit',
        component: StrategiesEdit,
        props: true,
      },
    ],
  },
  {
    // '/backtest'와 관련된 라우트들을 중첩하여 그룹화합니다.
    path: '/backtest',
    meta: { requiresAuth: true },
    children: [
      { path: 'run', name: 'backtest-run', component: BacktestRun },
      { path: 'results/:id', name: 'backtest-results', component: BacktestResults },
      { path: 'history', name: 'backtest-history', component: BacktestHistory },
    ],
  },
  { path: '/mypage', name: 'mypage', component: MyPage, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from) => {
  // 개발 환경에서는 인증 우회
  if (import.meta.env.DEV) {
    return true
  }

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth.token')
    if (!token) {
      return { name: 'login', query: { from: to.fullPath, msg: 'Please login to continue' } }
    }
  }
})

router.afterEach(() => {
  window.dispatchEvent(new CustomEvent('overlay:close'))
})

export default router
