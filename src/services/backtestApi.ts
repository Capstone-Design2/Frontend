import { http } from '@/services/http'
import type { BacktestRunRequest, BacktestResult, BacktestJob } from '@/types/Backtest'

/**
 * 백테스팅을 실행합니다.
 * @param request - 백테스팅 실행 요청 파라미터
 * @returns 백테스팅 실행 결과
 */
export const runBacktest = async (request: BacktestRunRequest): Promise<BacktestResult> => {
  const response = await http.post('/backtest/run', request)
  return response.data
}

/**
 * Job ID로 백테스팅 결과를 조회합니다.
 * @param jobId - 백테스트 Job ID
 * @returns 백테스팅 결과 상세
 */
export const getBacktestResultByJobId = async (jobId: number): Promise<BacktestResult> => {
  const response = await http.get(`/backtest/results/${jobId}`)
  return response.data
}

/**
 * 사용자의 백테스팅 결과 목록을 조회합니다.
 * @param limit - 조회할 결과 개수
 * @param offset - 건너뛸 결과 개수
 * @returns 백테스팅 결과 배열
 */
export const getBacktestResults = async (
  limit: number = 10,
  offset: number = 0,
): Promise<BacktestResult[]> => {
  const response = await http.get('/backtest/results', {
    params: { limit, offset },
  })
  return response.data
}

/**
 * Job ID로 백테스트 Job 정보를 조회합니다.
 * @param jobId - 백테스트 Job ID
 * @returns 백테스트 Job 정보
 */
export const getBacktestJob = async (jobId: number): Promise<BacktestJob> => {
  const response = await http.get(`/backtest/jobs/${jobId}`)
  return response.data
}

/**
 * 사용자의 백테스트 Job 목록을 조회합니다.
 * @param status - 필터링할 상태 (PENDING/RUNNING/COMPLETED/FAILED)
 * @param limit - 조회할 Job 개수
 * @param offset - 건너뛸 Job 개수
 * @returns 백테스트 Job 배열
 */
export const getBacktestJobs = async (
  status?: string,
  limit: number = 10,
  offset: number = 0,
): Promise<BacktestJob[]> => {
  const response = await http.get('/backtest/jobs', {
    params: { status, limit, offset },
  })
  return response.data
}
