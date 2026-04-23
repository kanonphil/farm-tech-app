/**
 * IoT 기기 관련 API (iotApi.ts)
 *
 * 백엔드 /api/actuator/** 및 /sensors/** 엔드포인트를 호출합니다.
 */

import { axiosInstance } from './axiosInstance';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

/** 데이터 출처 */
export type DataSource = 'LIVE' | 'DB_FALLBACK' | 'DB_ERROR';

/** /api/actuator/status 응답 */
export interface IoTStatus {
  source: DataSource;
  temperature: number | null;
  humidity:    number | null;
  lux:         number | null;
  airRaw:      number | null;
  ledOn:         boolean | null;
  ledBrightness: number  | null;
  fanOn:         boolean | null;
  fanSpeed:      number  | null;
  buzzerOn:      boolean | null;
  buzzerFreq:    number  | null;
  mode: 'auto' | 'manual' | null;
}

/** /sensors/history 단일 레코드 */
export interface SensorRecord {
  rawValue:    number;
  temperature: number;
  humidity:    number;
  lightValue:  number;
  recordedAt:  string;
}

/** /sensors/history 응답 */
export interface SensorHistory {
  dht:   SensorRecord[];
  light: SensorRecord[];
  air:   SensorRecord[];
}

// ─────────────────────────────────────────────
// 상태 조회
// ─────────────────────────────────────────────

/**
 * IoT 전체 상태 조회
 * Pi 실시간 → DB 폴백 → DB 오류 순으로 응답
 */
export const getIoTStatus = async (): Promise<IoTStatus> => {
  const res = await axiosInstance.get<IoTStatus>('/api/actuator/status');
  return res.data;
};

// ─────────────────────────────────────────────
// 모드 제어
// ─────────────────────────────────────────────

/**
 * 제어 모드 전환
 * @param mode 'auto' | 'manual'
 */
export const setMode = async (mode: 'auto' | 'manual'): Promise<void> => {
  await axiosInstance.post('/api/actuator/mode', null, { params: { mode } });
};

// ─────────────────────────────────────────────
// LED 제어
// ─────────────────────────────────────────────

/**
 * LED 켜기
 * @param brightness 0.0 ~ 1.0 (UI에서 %를 /100 변환해 전달)
 */
export const ledOn = async (brightness: number): Promise<void> => {
  await axiosInstance.post('/api/actuator/led/on', null, { params: { brightness } });
};

/** LED 끄기 */
export const ledOff = async (): Promise<void> => {
  await axiosInstance.post('/api/actuator/led/off');
};

// ─────────────────────────────────────────────
// 환풍기 제어
// ─────────────────────────────────────────────

/**
 * 환풍기 켜기
 * @param speed 0.0 ~ 1.0 (UI에서 %를 /100 변환해 전달)
 */
export const fanOn = async (speed: number): Promise<void> => {
  await axiosInstance.post('/api/actuator/fan/on', null, { params: { speed } });
};

/** 환풍기 끄기 */
export const fanOff = async (): Promise<void> => {
  await axiosInstance.post('/api/actuator/fan/off');
};

// ─────────────────────────────────────────────
// 부저 제어
// ─────────────────────────────────────────────

/**
 * 부저 켜기
 * @param freq 주파수 (Hz, 예: 440)
 */
export const buzzerOn = async (freq: number): Promise<void> => {
  await axiosInstance.post('/api/actuator/buzzer/on', null, { params: { freq } });
};

/** 부저 끄기 */
export const buzzerOff = async (): Promise<void> => {
  await axiosInstance.post('/api/actuator/buzzer/off');
};

// ─────────────────────────────────────────────
// 센서 이력 조회
// ─────────────────────────────────────────────

/**
 * 기간별 센서 이력 조회
 * @param start 'yyyy-MM-dd'
 * @param end   'yyyy-MM-dd'
 */
export const getSensorHistory = async (start: string, end: string): Promise<SensorHistory> => {
  const res = await axiosInstance.get<SensorHistory>('/sensors/history', { params: { start, end } });
  return res.data;
};