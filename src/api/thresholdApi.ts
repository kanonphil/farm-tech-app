/**
 * 임계값 프리셋 API (thresholdApi.ts)
 *
 * 백엔드 /thresholds/** 엔드포인트를 호출합니다.
 * 자동 제어의 기준이 되는 센서 임계값 프리셋을 관리합니다.
 */

import { axiosInstance } from './axiosInstance';

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

/** 임계값 프리셋 */
export interface ThresholdPreset {
  id: number;
  /** 프리셋 이름 (예: '기본값', '여름') */
  name: string;
  tempLow: number;   tempHigh: number;  // 온도 (°C)
  humLow: number;    humHigh: number;   // 습도 (%)
  airPpmLow: number; airPpmBad: number; // 대기질 주의/위험 (raw)
  luxLow: number;    luxHigh: number;   // 조도 (lux)
  isActive: boolean;
  createdAt: string;
}

/** 생성/수정 시 입력 타입 */
export type ThresholdPresetInput = Omit<ThresholdPreset, 'id' | 'isActive' | 'createdAt'>;

// ─────────────────────────────────────────────
// API 함수
// ─────────────────────────────────────────────

/** 전체 프리셋 목록 조회 */
export const getAllPresets = async (): Promise<ThresholdPreset[]> => {
  const res = await axiosInstance.get<ThresholdPreset[]>('/thresholds');
  return res.data;
};

/** 현재 활성 프리셋 조회 */
export const getActivePreset = async (): Promise<ThresholdPreset> => {
  const res = await axiosInstance.get<ThresholdPreset>('/thresholds/active');
  return res.data;
};

/** 프리셋 생성 */
export const createPreset = async (dto: ThresholdPresetInput): Promise<void> => {
  await axiosInstance.post('/thresholds', dto);
};

/** 프리셋 수정 */
export const updatePreset = async (id: number, dto: ThresholdPresetInput): Promise<void> => {
  await axiosInstance.put(`/thresholds/${id}`, dto);
};

/** 프리셋 삭제 */
export const deletePreset = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/thresholds/${id}`);
};

/**
 * 프리셋 활성화
 * 백엔드 내부에서 Pi에 즉시 통보 (notifyIoTServer)
 */
export const activatePreset = async (id: number): Promise<void> => {
  await axiosInstance.put(`/thresholds/${id}/activate`);
};