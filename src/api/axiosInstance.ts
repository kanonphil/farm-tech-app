/**
 * Axios 인스턴스 설정 (앱 버전)
 *
 * 웹 버전과 구조는 동일하지만 아래 두 가지가 다릅니다:
 *
 * 1. withCredentials 제거
 *    - 웹은 브라우저가 쿠키를 자동으로 관리해줌
 *    - 앱은 쿠키 자동 관리가 안 되므로 withCredentials가 의미 없음
 *    - 대신 토큰을 Authorization 헤더로만 전달
 *
 * 2. 로그인 만료 시 리다이렉트 방식 변경
 *    - 웹: window.location.href = '/login'
 *    - 앱: expo-router의 router.replace('/auth/login')
 *
 * ⚠️ Refresh Token 관련 주의사항:
 *    서버는 Refresh Token을 HTTP-only 쿠키로 관리합니다.
 *    React Native는 브라우저가 아니라서 쿠키를 자동으로 저장/전송하지 않습니다.
 *    현재는 웹과 동일하게 /members/refresh 호출을 시도하지만,
 *    실제 기기에서 테스트 후 쿠키 처리가 필요하면 팀원과 논의하세요.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import useAuthStore from '@/src/store/authStore';
import { BASE_URL } from '../constants';

// ─────────────────────────────────────────────
// Axios 인스턴스 생성
// ─────────────────────────────────────────────

export const axiosInstance = axios.create({
  // 서버 기본 URL — 실제 배포 서버 주소로 변경 필요
  // 개발 시: 안드로이드 에뮬레이터는 10.0.2.2, 실제 기기는 컴퓨터 IP 주소 사용
  baseURL: BASE_URL,
});

// ─────────────────────────────────────────────
// 요청 인터셉터 — 모든 요청에 토큰 자동 첨부
// ─────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // getState()로 Zustand store에서 토큰을 꺼냄
    // 훅(useAuthStore())은 React 컴포넌트 안에서만 쓸 수 있고
    // 여기는 컴포넌트 밖이므로 getState()를 사용
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[axios] 요청 오류:', error);
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// 응답 인터셉터 — 401 발생 시 토큰 갱신 시도
// ─────────────────────────────────────────────

/** 현재 토큰 갱신 요청이 진행 중인지 여부 */
let isRefreshing = false;

axiosInstance.interceptors.response.use(
  // 정상 응답은 그대로 반환
  (response) => response,

  async (error: AxiosError) => {
    console.error('[axios] 응답 오류:', error.response?.status, error.config?.url);

    const originalRequest = error.config;

    // 401(인증 만료)이고, refresh 요청 자체에서 난 오류가 아닐 때만 갱신 시도
    // refresh 요청에서도 401이 나면 무한 루프가 생기므로 반드시 체크 필요
    if (
      error.response?.status === 401 &&
      originalRequest?.url !== '/members/refresh'
    ) {
      // 이미 다른 요청이 갱신 중이면 중복 요청 방지
      if (isRefreshing) return Promise.reject(error);

      isRefreshing = true;

      try {
        // SecureStore에서 복원한 refreshToken을 헤더로 전송
        const { refreshToken } = useAuthStore.getState();
        
        // Refresh Token으로 새 Access Token 발급 요청
        const response = await axiosInstance.post('/members/refresh', null, {
          headers: refreshToken ? { 'Refresh=Token': refreshToken } : {},
        });

        const newToken = response.headers['authorization']?.replace('Bearer ', '')
        if (!newToken) throw new Error("새 토큰 없음");

        // 새 토큰을 store와 SecureStore에 저장
        await useAuthStore.getState().setToken(newToken);

        // 실패했던 원래 요청의 헤더를 새 토큰으로 교체 후 재시도
        if (originalRequest?.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        }
        return axiosInstance(originalRequest!);

      } catch (refreshError) {
        // Refresh Token도 만료된 경우 → 완전 로그아웃 처리
        await useAuthStore.getState().clearToken();

        // 알림 모달 표시 후 로그인 화면으로 이동
        // 웹의 window.location.href 대신 expo-router 사용
        useAuthStore.getState().showAlert(
          '로그인이 만료되었습니다. 다시 로그인해주세요.',
          () => router.replace('/auth/login')
        );

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);