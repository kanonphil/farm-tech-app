/**
 * IoT 기기 관련 API (iotApi.ts)
 *
 * 백엔드 GET /api/actuator/status 를 호출합니다.
 * 응답의 source 필드로 데이터 출처를 판단합니다.
 */

import { axiosInstance } from './axiosInstance';

/** 데이터 출처 */
export type DataSource = 'LIVE' | 'DB_FALLBACK' | 'DB_ERROR';

/** /api/actuator/status 응답 타입 */
export interface IoTStatus {
  /** 데이터 출처 */
  source: DataSource;
  // 센서 값 (LIVE, DB_FALLBACK 공통)
  temperature: number | null;
  humidity:    number | null;
  lux:         number | null;
  airRaw:      number | null;
  // 액추에이터 상태 (LIVE 전용, DB_FALLBACK은 null)
  ledOn:         boolean | null;
  ledBrightness: number  | null;
  fanOn:         boolean | null;
  fanSpeed:      number  | null;
  buzzerOn:      boolean | null;
  buzzerFreq:    number  | null;
  // 제어 모드 (LIVE 전용)
  mode: 'auto' | 'manual' | null;
}

/**
 * IoT 전체 상태 조회
 *
 * @returns Pi 실시간 / DB 폴백 / DB 오류 중 하나의 응답
 * @throws  네트워크 오류 또는 DB_ERROR(503) 시 예외
 */
export const getIoTStatus = async (): Promise<IoTStatus> => {
  const response = await axiosInstance.get<IoTStatus>('/api/actuator/status');
  return response.data;
};